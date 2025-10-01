"use client"
import { useRouter } from "next/navigation";

const Logout = () => {
  const router = useRouter();
  
  async function logouthandler(){
      localStorage.removeItem("token");
      router.push('/login')
  }
  return (
    <div className="">
      <button onClick={logouthandler}>Logout</button>
    </div>
  )
}

export default Logout