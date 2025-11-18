import moment from "moment"
 moment.locale('es')


export const dateFormat = (date:string) => {

  return moment(date).format('LLL')
}