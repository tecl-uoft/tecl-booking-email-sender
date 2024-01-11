require("dotenv").config();
import * as sgClient from '@sendgrid/client'
import * as sgMail from "@sendgrid/mail"
import { RetrieveTemplatesResponse, Template } from "@/types/sendgrid-types"
import { ClientRequest } from '@sendgrid/client/src/request';

const key = process.env.SENDGRID_API_KEY

if (typeof key === 'undefined') {
  throw new Error("Sendgrid API key is undefined")
}
sgClient.setApiKey(key);
sgMail.setApiKey(key)


export const getBookingTemplates = async (): Promise<Template[]> => {
  const queryParams = {
    "generations": "dynamic",
    "page_size": 100
  };

  const request: ClientRequest = {
    url: `/v3/templates`,
    method: 'GET',
    qs: queryParams
  }

  const resBody = (await sgClient.request(request))[0].body as RetrieveTemplatesResponse

  const bookingTemplates = resBody.result.filter((template: Template) => template.name.includes("Booking Email"))
  console.log(bookingTemplates)
  return bookingTemplates

}
const inpStudies = ["TryBaby","Tap n'Seek","Rubix","RP2", "LSM", "iPlay", "IDIB", "Dolly", "BabyGrit"]
export const sendEmails = async (formData: FormData) => {
  const raName = formData.get("raName")
  let errOrException: null | "error" | "exception" = null
  try {
    if (typeof raName !== "string") {
      errOrException = "exception"
      throw new Error("RA name is not a string")
    } else if (raName.length === 0) {
      errOrException = "exception"
      throw new Error("RA Name is empty")
    }
    const template = formData.get("template")
    console.log(template)
    if(typeof template !== "string"){
      throw new Error("template is not a string")
    }

    const templateJson: {id: string, name: string} = JSON.parse(template)

    const templateId = templateJson.id

    const templateName = templateJson.name

    const templateStudyName = templateName.split("Booking Email")[0].trim()

    const csvUpload = formData.get("csvUpload")

    if (csvUpload === null) {
      errOrException = "exception"
      throw new Error("no csv file has been provided")
    }
    else if (typeof csvUpload === "string") {
      errOrException = "exception"
      throw new Error("csvUpload is not a file")
    } else if (csvUpload.name.split(".").slice(-1)[0] !== "csv") {
      errOrException = "exception"
      throw new Error("csvUpload is not a valid csv file")
    }
    const csvText = (await csvUpload.text()).trim()
    const csvErrMsg = 'Invalid csv file. Must have the format "Parent Name,Child Name,Email".'
    if (typeof csvText !== "string") {
      errOrException = "exception"
      throw new Error("csvText should be string")
    }
    if (csvText === "") {
      errOrException = "exception"
      throw new Error(csvErrMsg)
    }
    const csvRows = csvText.split("\n")
    const firstRow = csvRows[0].trim().replace(/^"*|"*$/g,"")
    
    if (firstRow !== "Parent Name,Child Name,Email") {
      errOrException = "exception"
      throw new Error(csvErrMsg)
    }

    if (csvRows.length === 1) {
      errOrException = "exception"
      throw new Error("CSV file has no data")
    }
    let msgArr = []
    for (let i = 1; i < csvRows.length; i++) {
      const parentAndChild = csvRows[i].trim().replace(/^"*|"*$/g,"").split(",")
      console.log(parentAndChild)

      if (parentAndChild.length != 3) {
        errOrException = "exception"
        throw new Error("Improperly formatted row on line " + (i + 1) + ' of csv. Must have the format "Parent Name,Child Name,Email".')
      }

      const parent = parentAndChild[0]
      const child = parentAndChild[1]
      const email = parentAndChild[2]

      const emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/

      if (!emailRegex.test(email)) {
        errOrException = "exception"
        throw new Error("Improperly formatted row on line " + (i + 1) + ` of csv. Invalid email address "${email}".`)
      }

      if (emailRegex.test(parent)) {
        errOrException = "exception"
        throw new Error("Improperly formatted row on line " + (i + 1) + ` of csv. Email address present in "Parent Name" column.`)
      }

      if (emailRegex.test(child)) {
        errOrException = "exception"
        throw new Error("Improperly formatted row on line " + (i + 1) + ` of csv. Email address present in "Child Name" column.`)
      }

      const msg = {
        to: email,
        dynamic_template_data: {
          parentName: parent,
          childName: child,
          RAName: raName,
          subject:`Fun new ${inpStudies.includes(templateStudyName) ? "in-person" : "online"} study at TECL!`,        
        },
        from: {
          name: "TECL (Sommerville Lab)",
          email: "tecl.psychology@utoronto.ca",
        },
        templateId: templateId,
        asm: {
          groupId: 17226,
        },
      };
      console.log(msg)
      msgArr.push(msg)
    }

    for(let i=0; i<msgArr.length; i++){
      await sgMail.send(msgArr[i])
    }

  } catch(e){
    if(errOrException === "exception"){
      throw (e as Error)
    } else{
      console.log(e)
      throw new Error("There was an internal server error. Please notify the lab manager of this.")
    }
  }
}
