const catchAsyncErrors = require('../utils/catchAsyncErrors');
const driver = require('../neo4j');
const AppError = require('../utils/appError');


exports.getAllReaders = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    try {
        const result = await session.executeRead(tx =>
            tx.run(
            'MATCH (r:Reader) RETURN r;'
            )
        );
        let readers=[];
        result.records.forEach(e => {
            readers.push({  "id": e._fields[0].identity.low,
                            "properties" : e._fields[0].properties});
        });
        res.status(200).json({
            status:'success',
            result: readers.length,
            data : {
                readers
            }
        });
    }
    catch (e) {
    console.log(e)
    }
    finally {
        await session.close()
    }  
});

exports.getreaderById = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader) WHERE ID(r) = ${id} RETURN r;`
            )

        );
        if(result.records.length===0){
            return next(new AppError('No reader found with that id',404))
        }

        let reader = 
            {   "id": result.records[0]._fields[0].identity.low,
                "properties" : result.records[0]._fields[0].properties
            };

        res.status(200).json({
            status:'success',
            result: result.records.length,
            data : {
                reader
            }
        });
    }
    catch (e) {
    console.log(e)
    }
    finally {
        await session.close()
    }  
});

exports.getreaderByEmail = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let email = req.params.email;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader) WHERE r.email = '${email}' RETURN r;`
            )

        );
        if(result.records.length===0){
            return next(new AppError('No reader found with that id',404))
        }

        let reader = 
        {   "id": result.records[0]._fields[0].identity.low,
            "properties" : result.records[0]._fields[0].properties
        };
        res.status(200).json({
            status:'success',
            result: result.records.length,
            data : {
                reader
            }
        });
    }
    catch (e) {
    console.log(e)
    }
    finally {
        await session.close()
    }  
});

exports.getreadBooks = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[rel:HAS_READ]->(b:Book)
                 WHERE ID(r) = ${id} RETURN b.isbn,b.title,rel.rating, rel.review, rel.date;`
            )

        );
        let books = [];
        result.records.forEach(e=>{
            books.push({
                "isbn" :e._fields[0] ,
                "title" : e._fields[1] ,
                "rating" :e._fields[2].low,
                "review" :e._fields[3],
                "date" :new Date(e._fields[4].low)   
            });
           
        });

        res.status(200).json({
            status:'success',
            result: books.length,
            data : {
                books
            }
        });
    }
    catch (e) {
    console.log(e)
    }
    finally {
        await session.close()
    }  
});

exports.getwantBooks = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[rel:WANT_READ]->(b:Book)
                 WHERE ID(r) = ${id} RETURN b.isbn,b.title,rel.date;`
            )

        );
        let books = [];
        result.records.forEach(e=>{
            books.push({
                "isbn" :e._fields[0] ,
                "title" : e._fields[1] ,
                "date" :new Date(e._fields[2].low)   
            });
           
        });

        res.status(200).json({
            status:'success',
            result: books.length,
            data : {
                books
            }
        });
    }
    catch (e) {
    console.log(e)
    }
    finally {
        await session.close()
    }  
});

exports.getvisitedBooks = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[rel:VISITED]->(b:Book)
                 WHERE ID(r) = ${id} RETURN b.isbn,b.title,rel.date;`
            )

        );
        let books = [];
        result.records.forEach(e=>{
            books.push({
                "isbn" :e._fields[0] ,
                "title" : e._fields[1] ,
                "date" :new Date(e._fields[2].low)   
            });
           
        });

        res.status(200).json({
            status:'success',
            result: books.length,
            data : {
                books
            }
        });
    }
    catch (e) {
    console.log(e)
    }
    finally {
        await session.close()
    }  
});

exports.getlikedBooks = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[rel:LIKE]->(b:Book)
                 WHERE ID(r) = ${id} RETURN b.isbn,b.title;`
            )

        );
        let books = [];
        result.records.forEach(e=>{
            books.push({
                "isbn" :e._fields[0] ,
                "title" : e._fields[1]   
            });
           
        });

        res.status(200).json({
            status:'success',
            result: books.length,
            data : {
                books
            }
        });
    }
    catch (e) {
    console.log(e)
    }
    finally {
        await session.close()
    }  
});

exports.getreaderGenres = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[rel:HAS_READ_GENRE]->(g:Genre)
                 WHERE ID(r) = ${id} RETURN g.name,rel.reading_count ORDER BY rel.reading_count DESC;`
            )

        );
        let genres = [];
        result.records.forEach(e=>{
            genres.push({
                "name" :e._fields[0],
                "count" :e._fields[1].low  
            });
           
        });

        res.status(200).json({
            status:'success',
            result: genres.length,
            data : {
                genres
            }
        });
    }
    catch (e) {
    console.log(e)
    }
    finally {
        await session.close()
    }  
});

exports.getreaderFriends = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[:FOLLOWS]->(r2:Reader)
                 WHERE ID(r) = ${id} RETURN ID(r2),r2.first_name,r2.last_name,r2.email;`
            )

        );
        let friends = [];
        result.records.forEach(e=>{
            friends.push({
                "id" :e._fields[0].low,
                "first_name" :e._fields[1] ,
                "last_name" :e._fields[2],
                "email" :e._fields[3]
            });
           
        });

        res.status(200).json({
            status:'success',
            result: friends.length,
            data : {
                friends
            }
        });
    }
    catch (e) {
    console.log(e)
    }
    finally {
        await session.close()
    }  
});

exports.getreaderAuthors = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[:FAN_OF]->(a:Author)
                 WHERE ID(r) = ${id} RETURN a.key, a.name;`
            )

        );
        let authors = [];
        result.records.forEach(e=>{
            authors.push({
                "key" :e._fields[0] ,
                "name" :e._fields[1]
            });
           
        });

        res.status(200).json({
            status:'success',
            result: authors.length,
            data : {
                authors
            }
        });
    }
    catch (e) {
    console.log(e)
    }
    finally {
        await session.close()
    }  
});