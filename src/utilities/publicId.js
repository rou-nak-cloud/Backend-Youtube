function extractPublicIdFromUrl(url){
    try {
        const parts = url.split("/upload/")[1]
        // "v1744713073/difu9dsfwkvwvmuou2tb.mp4"
        const publicIdWithExt = parts.split(".")[0]
        //  "v1744713073/difu9dsfwkvwvmuou2tb"
        const publicParts = publicIdWithExt.split("/")
        // → ["v1744713073", "difu9dsfwkvwvmuou2tb"]

        if(publicParts[0].startsWith("v")){
            publicParts.shift() //remove version like v12345
        }
        return publicParts.join("/")
        // "difu9dsfwkvwvmuou2tb"  {also check if it is under any folder}
    } catch (error) {
        return null
    }
}

export {extractPublicIdFromUrl}
// http://res.cloudinary.com/dnftxpotm/video/upload/v1744713073/difu9dsfwkvwvmuou2tb.mp4