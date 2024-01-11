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

    const templateId = formData.get("templateId")

    if (typeof templateId !== "string") {
      errOrException = "exception"
      throw new Error("template ID is not a string")
    }

    const csvUpload = formData.get("csvUpload")
    console.log("hello")
    console.log(csvUpload)
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
    const firstRow = csvRows[0].trim()

    if (firstRow !== "Parent Name,Child Name,Email") {
      errOrException = "exception"
      throw new Error(csvErrMsg)
    }

    if (csvRows.length === 1) {
      errOrException = "exception"
      throw new Error("CSV file has no data")
    }

    for (let i = 1; i < csvRows.length; i++) {
      const parentAndChild = csvRows[i].trim().split(",")
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
          calendlyLink: "nothing test"
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
      sgMail.send(msg)
    }
  } catch(e){
    if(errOrException === "exception"){
      throw (e as Error)
    } else{
      throw new Error("There was an internal server error. Please notify the lab manager of this.")
    }
  }
}
