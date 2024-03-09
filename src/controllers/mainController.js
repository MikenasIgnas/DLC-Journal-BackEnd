import { MongoClient }       from 'mongodb'
import { findOneAndUpdate }  from '../shemas/FilledChecklistData'
import sendRes               from '../modules/UniversalRes'
// needs fixing
// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
require('dotenv').config()

// eslint-disable-next-line no-undef
const client = new MongoClient(process.env.MONGO_PATH)

export async function routeData (req, res) {
  const collection = client.db('ChecklistDB').collection('routesTable')
  const routes = await collection.find().sort({ id: 1 }).toArray()
  return sendRes(res, false, 'all routes', routes)
}

export async function areasData (req, res) {
  const collection = client.db('ChecklistDB').collection('areasTable')
  const areas = await collection.find().sort({ id: 1 }).toArray()
  return sendRes(res, false, 'all areas', areas)
}

export async function todoData (req, res) {
  const collection = client.db('ChecklistDB').collection('todoTable')
  const todo = await collection.find().sort({ id: 1 }).toArray()
  return sendRes(res, false, 'all todo', todo)
}

export async function problemsData (req, res) {
  const collection = client.db('ChecklistDB').collection('problemsTable')
  const problems = await collection.find().sort({ id: 1 }).toArray()
  return sendRes(res, false, 'all problems', problems)
}

export function postFilledChecklistData (req, res) {
  const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData')
  const historyIdCounter = client.db('ChecklistDB').collection('historyIdCounter')
  historyIdCounter.findOneAndUpdate(
    { id: 'historyId' },
    { '$inc': { 'seq': 1 } },
    { new: true, upsert: true },
    async (err, cd) => {
      let seqId
      if (!cd || !cd.value.seq) {
        seqId = 1
      }
      else {
        seqId = cd.value.seq
      }
      const filledData = {
        userName:     req.body.employee,
        filledData:   req.body.filledData,
        startDate:    req.body.startDate,
        startTime:    req.body.startTime,
        endDate:      req.body.endDate,
        endTime:      req.body.endTime,
        problemCount: req.body.problemCount,
        secret:       req.body.secret,
        userRole:     req.body.userRole,
        id:           String(seqId),
      }
      await checklistHistoryData.insertOne(filledData)
    }
  )
  return sendRes(res, false, 'all good', null)
}

export async function getSingleHistoryELementData (req, res) {
  const { id } = req.params
  const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData')
  const singleHistoryElementData = await checklistHistoryData.findOne({ id })
  return sendRes(res, false, 'getSingleHistoryELementData', singleHistoryElementData)
}

export async function updateFilledChecklistData (req, res) {
  const { pageId, values } = req.body
  await findOneAndUpdate({ pageId: String(pageId) }, { $set: { values: values } }, { new: true })
  res.send({ success: true })
}

export async function checklistHistoryCount (req, res) {
  const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData')
  const totalHistoryData = await checklistHistoryData.countDocuments()
  return sendRes(res, false, 'totalHistoryData', totalHistoryData)
}

export async function getTotalAreasCount (req, res) {
  const collection = client.db('ChecklistDB').collection('areasTable')
  const totalAreasCount = await collection.countDocuments()
  return sendRes(res, false, 'totalAreasCount', totalAreasCount)
}

export async function changedUsername (req, res) {
  const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData')
  const username = req.body.employee
  const { id } = req.params
  const changeUsernameInHistoryElements = await checklistHistoryData.updateMany(
    { id: Number(id) },
    { $set: { userName: username } }
  )
  return sendRes(res, false, 'changeUsernameInHistoryElements', changeUsernameInHistoryElements)
}

export async function deleteHistoryItem (req, res) {
  const historyItem = client.db('ChecklistDB').collection('checklistHistoryData')
  const id = req.query.id
  const result = await historyItem.findOneAndDelete({ id: id })
  if (result.value === null) {
    return res.status(404).json({ error: 'Document not found' })
  }
  res.send({ success: true })
}

export async function latestHistoryItem (req, res) {
  const historyItem = client.db('ChecklistDB').collection('checklistHistoryData')
  const latestHistoryItem = await historyItem.find().sort({ _id: -1 }).limit(1).toArray()
  sendRes(res, false, 'latestHistoryItem', latestHistoryItem)
}

export async function updateHistoryItem (req, res) {
  const historyItem = client.db('ChecklistDB').collection('checklistHistoryData')
  const { id } = req.params
  const item = await historyItem.findOneAndUpdate(
    { id },
    { $set: { filledData: req.body.updatedArray, problemCount: req.body.problemCount } }
  )
  sendRes(res, false, 'latestHistoryItem', item.value)
}

export async function getHistoryData (req, res) {
  const historyItem = client.db('ChecklistDB').collection('checklistHistoryData')
  const items = await historyItem
    .aggregate([
      { $sort: { id: 1 } },
      { $addFields: { numericId: { $toInt: '$id' } } },
      { $sort: { numericId: -1 } },
      { $unset: 'numericId' },
    ])
    .toArray()
  sendRes(res, false, 'historyItems', items)
}

export async function postPhotos (req, res) {
  const problemPhotos = client.db('ChecklistDB').collection('problemPhotos')
  const historyIdCounter = client.db('ChecklistDB').collection('historyIdCounter')
  const historyItemId = await historyIdCounter.findOne({ id: 'historyId' })
  const count = await problemPhotos.countDocuments()
  if (count === 0) {
    await problemPhotos.updateMany(
      { checklistId: historyItemId.seq - 1 },
      { $set: { checklistId: Number(historyItemId.seq) } }
    )
    const photosWithChecklistId = req.body.map((item) => ({
      ...item,
      checklistId: historyItemId.seq,
    }))
    for (const item of photosWithChecklistId) {
      await problemPhotos.insertOne(item)
    }
    sendRes(res, false, 'problemPhotos', historyItemId)
  } else {
    await problemPhotos.updateMany(
      { checklistId: historyItemId.seq - 1 },
      { $set: { checklistId: Number(historyItemId.seq) } }
    )
    const photosWithChecklistId = req.body.map((item) => ({
      ...item,
      checklistId: historyItemId.seq,
    }))
    for (const item of photosWithChecklistId) {
      const filter = {
        checklistId: item.checklistId,
        photoId:     item.photoId,
      }
      const update = { $set: { photo: item.photo } }
      const options = { upsert: true }
      await problemPhotos.updateMany(filter, update, options)
    }
    sendRes(res, false, 'postLastestAndCurrentPhotos', photosWithChecklistId)
  }
}

export async function postLastestAndCurrentPhotos (req, res) {
  const problemPhotos = client.db('ChecklistDB').collection('problemPhotos')
  const historyIdCounter = client.db('ChecklistDB').collection('historyIdCounter')
  const historyItemId = await historyIdCounter.findOne({ id: 'historyId' })
  const currentPhotos = req.body.currentPhotos // FROM LOCAL STORAGE
  if (currentPhotos) {
    const photosWithChecklistId = currentPhotos.map((item) => ({
      ...item,
      checklistId: historyItemId.seq,
    }))
    for (const item of photosWithChecklistId) {
      await problemPhotos.updateMany(
        { checklistId: item.checklistId, photo: item.photo, photoId: item.photoId },
        { $set: { photo: item.photo } },
        { upsert: true }
      )
    }
    sendRes(res, false, 'postLastestAndCurrentPhotos', photosWithChecklistId)
  }
}

export async function postLatestPhotos (req, res) {
  const problemPhotos = client.db('ChecklistDB').collection('problemPhotos')
  const historyIdCounter = client.db('ChecklistDB').collection('historyIdCounter')
  const historyItemId = await historyIdCounter.findOne({ id: 'historyId' })
  const updateLatest = await problemPhotos.updateMany(
    { checklistId: historyItemId.seq - 1 },
    { $set: { checklistId: Number(historyItemId.seq) } }
  )
  sendRes(res, false, 'postLatestPhotos', updateLatest)
}

export async function getPhotos (req, res) {
  const problemPhotos = client.db('ChecklistDB').collection('problemPhotos')
  const { photoId } = req.params
  const photos = await problemPhotos.find({ checklistId: Number(photoId) }).toArray()
  sendRes(res, false, 'getPhotos', photos)
}

export async function latestPhotos (req, res) {
  const lastesPhotos = client.db('ChecklistDB').collection('problemPhotos')
  const historyIdCounter = client.db('ChecklistDB').collection('historyIdCounter')
  const historyItemId = await historyIdCounter.findOne({ id: 'historyId' })

  const latestHistoryItemPhotos = await lastesPhotos.find({
    checklistId: historyItemId.seq - 1,
  }).toArray()

  sendRes(res, false, 'lastestPhotos', latestHistoryItemPhotos)
}

export async function deletePhoto (req, res) {
  const photos = client.db('ChecklistDB').collection('problemPhotos')
  const { photoId } = req.params
  await photos.findOneAndDelete({ photoId })
  res.send({ success: true })
}

export async function generateMonthlyPDFReport (req, res) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1 // Month is 0-based, so add 1
  const day = today.getDate()
  const currentDate = `${year}/${month}/${day}`

  let newYear = year
  let newMonth = month - 1
  if (newMonth < 1) {
    newMonth = 12
    newYear--
  }

  const dateMonthAgo = `${newYear}/${newMonth}/${day}`
  const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData')
  const allHistoryData = await checklistHistoryData.find().toArray()
  const startDateRangeStart = new Date(dateMonthAgo)
  const endDateRange = new Date(currentDate)
  const filteredData2 = allHistoryData?.filter(user => {
    const userStartDate = new Date(user.endDate)
    return userStartDate >= startDateRangeStart && userStartDate <= endDateRange
  })

  const filteredData = filteredData2?.map(user => ({
    ...user,
    filledData: user?.filledData?.filter(page => {
      const values = Object?.values(page?.values)
      return values?.some(pageValues =>
        Object?.values(pageValues)?.some(value =>
          typeof value === 'object' ?
            Object?.values(value)?.some(innerValue => innerValue === true) :
            value === true
        )
      )
    }),
  }))

  return sendRes(res, false, 'totalHistoryData', filteredData)
}
export async function getSpecificDateReport (req, res) {
  const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData')
  const allHistoryData = await checklistHistoryData.find().toArray()
  const startDate = req.query.startDate
  const endDate = req.query.endDate
  const startDateRangeStart = new Date(startDate)
  const endDateRange = new Date(endDate)
  const filteredData2 = allHistoryData?.filter(user => {
    const userStartDate = new Date(user.endDate)
    return userStartDate >= startDateRangeStart && userStartDate <= endDateRange
  })

  const filteredData = filteredData2?.map(user => ({
    ...user,
    filledData: user?.filledData?.filter(page => {
      const values = Object?.values(page?.values)
      return values?.some(pageValues =>
        Object?.values(pageValues)?.some(value =>
          typeof value === 'object' ?
            Object?.values(value)?.some(innerValue => innerValue === true) :
            value === true
        )
      )
    }),
  }))
  const filterEmptyFilledData = filteredData.filter((el) => el.filledData.length > 0)
  return sendRes(res, false, 'totalHistoryData', filterEmptyFilledData)
}