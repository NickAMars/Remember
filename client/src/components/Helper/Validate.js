export const validatePsw = (pwd__org,pwd__ckd) =>{
  // console.log(pwd__org,pwd__ckd);
  if(pwd__org.length === pwd__ckd.length){
    for(let i = 0; i < pwd__org.length; i++)
      if(pwd__org[i] !== pwd__ckd[i])
        return false; // case
    return true;
  }else
    return false;
}
