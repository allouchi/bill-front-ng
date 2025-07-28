export  class Util {
  private constructor() {}

  public static isPrestaNotValid(dateString: string): boolean {
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Les mois sont indexés à partir de 0
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    const current = new Date();
    if(current > date ){
        return false;
    }
    return true;
  }
}
