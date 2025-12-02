import Entry from '../components/Entry'
import Program from '../components/Program'
import Select from '../components/Select'
import inputs_template from '../lib/inputs'
import {createContext, useState,useEffect} from 'react'

const Home = () => {

    const [form,setForm] = useState({})
    const [inputs,setInputs] = useState(inputs_template)
    const [question,setQuestion] = useState(0)
    const [submitted,setSubmitted] = useState(false)

    const addShowing = () => {
        const updatedInputs = inputs.map(input => ({
            ...input,
            'show':false
        }))

        setInputs(updatedInputs)
                console.log(inputs)

    }
    
    // useEffect( () => {
    //     addShowing()
    //     console.log(inputs)
        
    // },[inputs])

    return (
        <div className="Home">
            {
                !submitted && [inputs[question]].map((input) => {
                    // console.log(input)
                    if (input) {
                        if (input.type === "entry") {
                            return (<Entry question={input.question} form={form} setForm={setForm}></Entry>)
                        }
                        if (input.type === "select") {
                            return (<Select question={input.question} options={input.options} form={form} setForm={setForm}/>)
                        }
                    }
                    
                })
            }
            <br />
            {
                !submitted ? 

                question == inputs.length-1 ? 
                <div className="form-controls">
                <button onClick={() => question > 0 && setQuestion(question-1)}>Back</button>
                <button onClick={() => setSubmitted(true)}>Submit</button>
                </div>
                :
                <div className="form-controls">
                 <button onClick={() => question > 0 && setQuestion(question-1)}>Back</button>
                <button onClick={() => question + 1 < inputs.length && setQuestion(question+1)}>Next</button>
                </div>

                :
                
                ""
            }

            {
                submitted ?
                <div className="programs">          
                <h2>Explore Benefits</h2>          
                <Program type="calfresh" form={form} />
                <Program type="medical" form={form} />
                <Program type="calworks" form={form} />
                <Program type="ssi" form={form} />
                <Program type="section8" form={form} />
                </div>
                :
                ""
            }
           
            
        </div>
    )
}
export default Home