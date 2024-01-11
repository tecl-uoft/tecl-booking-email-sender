import {signOut} from "@/auth"
import SignOutFormButton from "@/components/SignOutFormButton"
import Link from "next/link"
export default function NotAuthorized(){
    return (
        <div style={{width:"100%", textAlign:"center", marginTop:"40px"}}>
            <p style={{marginBottom:"50px"}}>Scheduling emails successfully sent!</p>
            <Link href="/" style={{color:"#0074de"}} className="hover:underline">Send another batch of emails</Link>
            <SignOutFormButton text={"Sign out"} />
        </div>
    )
}
