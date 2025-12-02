const Select = ({question,options,form,setForm}) => {
    return (
        <div className="Select">
            <h2>{question}</h2>
            {
                options.map((option) => 
                {
                    return (
                    <>
                    <input type="radio" name="select" value={option} onClick={(e) => {
                        setForm({...form,[question]:option})
                    }}></input>
                    <label>{option}</label>
                    <br />
                    </>
                )
                })
            }
        </div>

    )
}

export default Select