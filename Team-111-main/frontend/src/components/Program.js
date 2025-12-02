import {useState} from 'react'
import createPDF from '../lib/createPDF'
import { FaCheck } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

const Program = ({type,form}) => {
    const [open,setOpen] = useState(false)

    if (type=="calfresh") {
        return (
        <div className="Program">
            <button onClick={() => setOpen(!open)}>CalFresh</button>
            {open ? CalFreshEligibility(form) : ""}
        </div>
    )
    
    }
    else if (type=="medical") {
        return (
        <div className="Program">
            <button onClick={() => setOpen(!open)}>MediCal</button>
            {open ? CalFreshEligibility(form) : ""}
        </div>
    )
    }
    else if (type=="calworks") {
        return (
        <div className="Program">
            <button onClick={() => setOpen(!open)}>CalWorks</button>
            {open ? CalFreshEligibility(form) : ""}
        </div>
    )
    }
    else if (type=="ssi") {
        return (
        <div className="Program">
            <button onClick={() => setOpen(!open)}>Supplemental Security Income</button>
            {open ? CalFreshEligibility(form) : ""}
        </div>
    )
    }
    else if (type=="section8") {
        return (
        <div className="Program">
            <button onClick={() => setOpen(!open)}>Section 8 Housing</button>
            {open ? CalFreshEligibility(form) : ""}
        </div>
    )
    }
    
}

const CalFreshEligibility = (form) => {
    if (form["What is your household's gross monthly income?"] < 30000) {
        return (
            <>
                <br />
                <p><FaCheck color="green"/> You are eligible!</p>
                <button onClick={() => createPDF(form)}><FaFilePdf color="red"/> Download PDF</button>
            </>
            
        )
    } else {
        return (
            <div><p><MdCancel color="red"/> You are not eligible</p></div>
        )
    }
}

export default Program