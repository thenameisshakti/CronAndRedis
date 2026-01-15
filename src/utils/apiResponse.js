class apiResponse{
    constructor(status,data,message){
        this.status = status
        this.data = data
        this.message = message
        this.success = true
    }
}

export default apiResponse