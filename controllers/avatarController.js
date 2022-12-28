const catchAsyncErrors = require('../utils/catchAsyncErrors');
const driver = require('../neo4j');
const AppError = require('../utils/appError');
const multer = require('multer');
const fs = require("fs");

const upload = multer({
    dest: `${__dirname}/../public/img/users`
  });

exports.upload = upload;

exports.setAvatar = catchAsyncErrors(async (req,res,next)=>{

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

        const tempPath = req.file.path;
        const targetPath = `${__dirname}/../public/img/users/${id}.jpeg`;

        fs.rename(tempPath, targetPath, err => {
            if (err) return next(new AppError('Internal server error',500));
        }); 

        const update = await session.executeWrite(tx =>
            tx.run(
                `MATCH (r:Reader)
                 WHERE ID(r) = ${id}
                 SET 
                 r.avatar="img/users/${id}.jpeg";`
            )
        );
        res.status(200).json({
            status:'success'
        });
    }
    catch (e) {
    return next(new AppError('Internal server error',500))
    }
    finally {
        await session.close()
    }  
});

exports.getAvatar = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
             
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader) WHERE ID(r) = ${id} RETURN r.avatar;`
            )

        );
        if(result.records.length===0){
            return next(new AppError('No reader found with that id',404))
        }
        
        const filePath = `/${result.records[0]._fields[0]}`
        res.redirect(filePath);
    }
    catch (e) {
        console.log(e);
    return next(new AppError('Internal server error',500))
    }
    finally {
        await session.close()
    }  
});

exports.removeAvatar = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
             
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader) WHERE ID(r) = ${id} RETURN r.avatar;`
            )

        );
        if(result.records.length===0){
            return next(new AppError('No reader found with that id',404))
        }
        
        const remove = await session.executeWrite(tx =>
            tx.run(
                `MATCH (r:Reader)
                 WHERE ID(r) = ${id}
                 SET 
                 r.avatar="img/other/default.jpeg";`
            )
        );
        res.status(200).json({
            status:'success'
        });
    }
    catch (e) {
    return next(new AppError('Internal server error',500))
    }
    finally {
        await session.close()
    }  
});

/* for testing*/
exports.getAvatarForm = catchAsyncErrors(async (req,res,next)=>{
         res.set('Content-Type', 'text/html');
         res.send(Buffer.from(
            `<form method="post" enctype="multipart/form-data" >
                <input type="file" name="file">
                <input type="submit" value="Submit">
            </form>`)
            );
});