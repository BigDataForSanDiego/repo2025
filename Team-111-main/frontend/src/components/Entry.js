import { formContext } from "../pages/Home"
import { IoMdInformationCircleOutline } from "react-icons/io";

const Entry = ({question,form,setForm}) => {
    return (
        <div className="Entry">
            <h2>{question} <IoMdInformationCircleOutline /></h2>
            <input value={form[question] || ""} onChange={(e) => {
                setForm({...form,[question]:e.target.value})
            }}></input>        
        </div>

    )
}

export default Entry