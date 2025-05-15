import axios from "axios";
import Config from '../../config'

type LoginData = {
    email: string;
    password: string;
  };

export const login = (data: LoginData) =>{
    return new Promise((resolve, reject) =>{
        axios.post(`${Config.BaseUrl}/login`,{
            data
        }).then((result) =>{
            resolve(result.data)
        })
        .catch((error)=>{
            console.log("the error",error)
            reject(error)
        })
    })
};