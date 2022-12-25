const catchAsyncErrors = require('../utils/catchAsyncErrors');
const driver = require('../neo4j');
const AppError = require('../utils/appError');

exports.getAllAuthors = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    try {
        const result = await session.executeRead(tx =>
            tx.run(
            'MATCH (a:Author) RETURN a;'
            )
        );
        let authors=[];
        result.records.forEach(e => {
            authors.push(e._fields[0].properties);
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


exports.getAuthor= catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let key = req.params.key;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(a:Author) WHERE a.key = '${key}' RETURN a;`
            )

        );
        if(result.records.length===0){
            return next(new AppError('No author found with that key',404))
        }

        let author = result.records[0]._fields[0].properties;

        let books = await session.executeRead(tx =>
            tx.run(
                `MATCH (b:Book)<-[w:HAS_WRITTEN]-(a:Author)
                 WHERE a.key = '${key}' 
                 RETURN b.title, b.isbn, w.date;`
            )
        );
        let author_books = [];
        books.records.forEach(e => {
            author_books.push(e._fields)
        });

        res.status(200).json({
            status:'success',
            result: result.records.length,
            data : {
                author,
                author_books
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

exports.getAuthorBooks= catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let key = req.params.key;
    try {

        let books = await session.executeRead(tx =>
            tx.run(
                `MATCH (b:Book)<-[w:HAS_WRITTEN]-(a:Author)
                 WHERE a.key = '${key}' 
                 RETURN b.title, b.isbn, w.date;`
            )
        );
        let author_books = [];
        books.records.forEach(e => {
            author_books.push(e._fields)
        });

        res.status(200).json({
            status:'success',
            result: author_books.length,
            data : {
                author_books
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

exports.getAuthorFans= catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let key = req.params.key;
    try {

        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH (a:Author)<-[:FAN_OF]-(r:Reader)
                 WHERE a.key = '${key}' 
                 RETURN r.first_name,r.last_name,r.email`
            )
        );

        let fans = [];
        result.records.forEach(e=>{
            fans.push(e._fields);
        })

        res.status(200).json({
            status:'success',
            result: fans.length,
            data : {
                fans
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