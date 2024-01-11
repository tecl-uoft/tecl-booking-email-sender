import { getBookingTemplates, sendEmails} from "@/functions/sendgrid"
import {auth, signIn, signOut} from "@/auth"
import Image from "next/image"
import { redirect } from "next/navigation"
import SignOutFormButton from "@/components/SignOutFormButton"
import "../styles/template-select.scss"
export default async function Home({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const session = await auth()

  console.log(searchParams)

  const isThereErrors = ("error" in searchParams)
  let errMsg = null

  if(isThereErrors){
    errMsg = searchParams.error
  }
  console.log("session: ")
  console.log(session)
  if(!session){
    return (
      <div style={{position:"absolute", top:"50%", bottom:"50%", width:"100%", left:0}}>
          <form style={{width:"100%", display:"flex", justifyContent:"center"}} action={async()=>{
              "use server"
              await signIn("google")
          }} method="POST">
            <button type="submit" style={{padding:"12px 12px 12px 12px", backgroundColor:"white", border:"none", borderRadius:"20px",
             width:"200px", display:"flex", alignItems:"center", justifyContent:"center",columnGap:"12px"}} className="hover:cursor-pointer">
              <Image loading="lazy" alt="" height="24" width="24" id="provider-logo" src="https://authjs.dev/img/providers/google.svg" />
              <span style={{fontSize:"14px", color:"black"}}>Sign in with Google</span>
            </button>
          </form>
      </div>
    )
  } else if(session.user?.email !== "tecl.utoronto@gmail.com"){
    return redirect("/not-authorized")
  }

  let bookingTemplates = await getBookingTemplates();
  return (
    <main>
      <div style={{display:"flex", flexDirection:"column", alignItems:"center", marginTop:"65px"}}>
        {
          bookingTemplates.length === 0 ? 
          <p>No booking email templates found. This is likely a error that should be reported over Slack</p>:
          <form className="template-form-style" action={
          async (e)=>{
            "use server"
            try{
              await sendEmails(e)
            } catch(err){
              let msg = (err as Error).message;

              if(msg === "RA Name is empty"){
                msg = "Your name has not been provided"
              } else if(msg === "csvUpload is not a valid csv file"){
                msg = "A valid csv file has not been selected"
              }
              
              let urlMsg = msg.replace(" ", "%20")
              redirect("/?error="+urlMsg)
            }
            redirect("/success")
        }
          }>
            <div>
              <label htmlFor="raName">Your name</label>
              <input type="text" name="raName" id="raName"/>
            </div>
            <div>
              <label htmlFor="templateId">Template</label>
              <select name="template" id="templateId">
                {bookingTemplates.map((template)=>{
                  return <option key={template.name} value={`{"id":"${template.id}", "name":"${template.name}"}`}>{template.name}</option>
                })}
              </select>
            </div>
            <div style={{display:"flex"}}>
              <label htmlFor="csvUpload">CSV File</label>
              <input type="file" name="csvUpload" accept=".csv" id="csvUpload" style={{color:"white"}}/>
            </div>
            <button type="submit">Send emails</button>
            {isThereErrors ? <p style={{color:"red"}}>Error: {errMsg}</p> : null}
          </form>
        }
        <SignOutFormButton text={"Sign Out"} />
      </div>
    </main>
  )
}
