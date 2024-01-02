const MongoClient =         require('mongodb').MongoClient;
require('dotenv').config();
const client =              new MongoClient(process.env.MONGO_PATH);

const paginatedResults = (model: any, db: string, collection: any) => {
    return async (req: any, res: any, next: any) => {
      const dbCollection =  client.db(db).collection(collection);
      const page =          parseInt(req.query.page);
      const limit =         parseInt(req.query.limit);
      const filterOption =  req.query.search;
      const startIndex =    (page - 1) * limit;
      const endIndex =      page * limit;
      const results: any =       {};
      const selectFilter =  req.query.selectFilter;
      const tableSorter   = req.query.tableSorter;
      try {
        if (endIndex < await model.countDocuments().exec()) {
          results.next = { page: page + 1, limit: limit };
        }
        if (startIndex > 0) {
          results.previous = { page: page - 1, limit: limit };
        }
  
        let query;
        if (filterOption !== undefined) {
          const filterFunction = (item: any) => {
            for (const key in item) {
              if (key === 'signature') {
                continue
              }
              if (typeof item[key] === 'string' && item[key].toLowerCase().includes(filterOption)) {
                return true;
              }
            }
            return false;
          };
          const allDocuments = await dbCollection.find().toArray();
          const filteredDocuments = allDocuments.filter(filterFunction);
          query = dbCollection.find({ _id: { $in: filteredDocuments.map((doc: any) => doc._id) } });
        } else if (selectFilter !== undefined) {
          const filterFunction = (item: any) => {
              for (const key in item) {
                  if (key === 'signature') {
                      continue;
                  }
                  if(selectFilter === 'hasProblems'){
                    if(item.problemCount > 0){
                      return true
                    }
                  }
                  if(selectFilter === 'noProblems'){
                    if(item.problemCount <= 0){
                      return true
                    }
                  }
                  if(selectFilter === 'user'){
                    if(!item.isAdmin){
                      return true
                    }
                  }
                  if(selectFilter === 'admin'){
                    if(item.isAdmin){
                      return true
                    }
                  }
                  if(selectFilter === 'active'){
                    if(!item.isDisabled){
                      return true
                    }
                  }
                  if(selectFilter === 'inactive'){
                    if(item.isDisabled){
                      return true
                    }
                  }
                  if (typeof item[key] === 'string' && item[key].toLowerCase() === selectFilter.toLowerCase()) {
                      return true;
                  }
              }
              return false;
          };
          const allDocuments = await dbCollection.find().toArray();
          const filteredDocuments = allDocuments.filter(filterFunction);
          query = dbCollection.find({ _id: { $in: filteredDocuments.map((doc: any) => doc._id) } });

      }else if( tableSorter !== undefined){
        if(tableSorter === 'asc'){
          query = dbCollection.find().sort({id: 1});
        }else{
          query = dbCollection.find().sort({id: -1});
        }
      }else {
          query = dbCollection.find().sort({id: -1});
        }
        results.results = await query.skip(startIndex).limit(limit).toArray();
        res.paginatedResults = results;
        next();
      } catch (e: any) {
        res.status(500).json({ message: e.message });
      }
    };
  }

  const paginatedVisitsResults = (model: any, collection: any) => {
    return async (req: any, res: any, next: any) => {
      const dbCollection  = client.db('ChecklistDB').collection(collection);
      const page          = parseInt(req.query.page);
      const limit         = parseInt(req.query.limit);
      const filterOption  = req.query.search;
      const startIndex    = (page - 1) * limit;
      const endIndex      = page * limit;
      const results: any  = {};
      const selectFilter  = req.query.selectFilter;
      const tableSorter   = req.query.tableSorter;
      try {
        if (endIndex < await model.countDocuments().exec()) {
          results.next = { page: page + 1, limit: limit };
        }
        if (startIndex > 0) {
          results.previous = { page: page - 1, limit: limit };
        }
  
        let query;
        if (filterOption !== undefined) {
          const filterFunction = (item: any, filterOption: any) => {
            if (filterOption !== undefined) {
              const visitors = item.visitors.map((el: any) => el.selectedVisitor);
              for (const visitor of [...visitors, item]) {
                for (const key in visitor) {
                  const value = visitor[key];
                  if (
                    key !== 'signature' &&
                    (typeof value === 'string' || typeof value === 'number') &&
                    value.toString().toLowerCase().includes(filterOption.toLowerCase())
                  ) {
                    return true;
                  }
                }
              }
              return false;
            }
          };
        
          const allDocuments = await dbCollection.find().toArray();
          const filteredDocuments = allDocuments.filter((item: any) =>
            filterFunction(item, filterOption)
          );
        
          query = dbCollection.find({ _id: { $in: filteredDocuments.map((doc: any) => doc._id) } });
        }else if (selectFilter !== undefined) {
          const filterFunction = (item: any) => {
              for (const key in item) {
                  if (key === 'signature') {
                      continue;
                  }
                  if (typeof item[key] === 'string' && item[key].toLowerCase() === selectFilter.toLowerCase()) {
                      return true;
                  }
              }
              return false;
          };
      
          const allDocuments = await dbCollection.find().toArray();
          const filteredDocuments = allDocuments.filter(filterFunction);
          query = dbCollection.find({ _id: { $in: filteredDocuments.map((doc: any) => doc._id) } });
      }else if( tableSorter !== undefined){
        if(tableSorter === 'asc'){
          query = dbCollection.find().sort({id: 1});
        }else{
          query = dbCollection.find().sort({id: -1});
        }
      }else {
          query = dbCollection.find().sort({id: -1});
        }
  
        results.results = await query.skip(startIndex).limit(limit).toArray();
        res.paginatedResults = results;
        next();
      } catch (e: any) {
        res.status(500).json({ message: e.message });
      }
    };
  }



  export  {paginatedResults, paginatedVisitsResults}