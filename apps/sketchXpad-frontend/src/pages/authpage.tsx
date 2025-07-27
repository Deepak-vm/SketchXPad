import { AuthPage } from "../components/Auth";

function SignIn(){
    return <AuthPage isSignin={true} />;
}

function SignUp(){
    return <AuthPage isSignin={false} />;
}


export { SignIn, SignUp };