import multer from 'multer';

const storage  = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb){
        // cb(null, Date.now() + "-" + file.originalname)
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage,
    // storage: storage,
    // limits: {
    //     fileSize: 1024 * 1024 * 100 // 100 MB
    // },
}) 
export { upload }
