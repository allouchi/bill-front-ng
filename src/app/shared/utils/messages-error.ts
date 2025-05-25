export const GetMessagesEroor = (error: any) : string => {   
  console.log(error) 
  if(error.message.includes("Unknown Error")){
    return "Erreur de connexion au serveur";
  }
   return error.error.message;
  };

  export default GetMessagesEroor;