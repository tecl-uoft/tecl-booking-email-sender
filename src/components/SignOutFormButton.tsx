import {signOut} from "@/auth"
import { SignOutFormButtonProps } from "@/types/component-types"
export default function SignOutFormButton({text, ...props}: SignOutFormButtonProps){
    return (
        <form style={{width:"100%", display:"flex", justifyContent:"center", color:"#f71908"}} action={async()=>{
            "use server"
            await signOut({redirectTo:"/"})
        }} {...props} method="POST">
            <button type="submit" style={{padding:"12px 12px 12px 12px", backgroundColor:"white", border:"none", borderRadius:"20px",
                width:"200px", display:"flex", alignItems:"center", justifyContent:"center", columnGap:"12px", marginTop:"40px"}} className="hover:cursor-pointer">
                <span style={{fontSize:"14px"}}>{text}</span>
            </button>
        </form>
    )
}
