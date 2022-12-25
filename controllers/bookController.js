const catchAsyncErrors = require('../utils/catchAsyncErrors');
const driver = require('../neo4j');
const AppError = require('../utils/appError');

exports.getAllBooks = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    try {
        const result = await session.executeRead(tx =>
            tx.run(
            'MATCH (b:Book) RETURN b;'
            )
        );
        let books=[];
        result.records.forEach(e => {
            books.push(e._fields[0]);
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



exports.getBookByISBN = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let isbn = req.params.isbn;
    console.log(isbn)
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(b:Book) WHERE b.isbn = '${isbn}' RETURN b;`
            )
        );
        if(result.records.length===0){
            return next(new AppError('No book found with that isbn',404))
        }

        let book = result.records[0]._fields[0];

        res.status(200).json({
            status:'success',
            result: result.records.length,
            data : {
                book
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

