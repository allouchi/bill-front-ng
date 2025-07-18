export const GetMessagesError = (error: any): any => {

  if(error.message.includes("Unknown Error")){
    return "Erreur de connexion au serveur";
  }
  return error;
  };

export default GetMessagesError;