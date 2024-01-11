import {signOut} from "@/auth"
import SignOutFormButton from "@/components/SignOutFormButton"
export default function NotAuthorized(){
    return (
        <div style={{width:"100%", textAlign:"center", marginTop:"40px"}}>
            <p>You are not authorized to use this application.</p>
            <SignOutFormButton text={"Sign in with valid account"}/>
        </div>
    )
}
