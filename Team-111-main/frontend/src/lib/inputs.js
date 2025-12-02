const inputs_template = [
    {
        question:"Who are you completing this for?",
        type:"select",
        options:[
            "Myself",
            "Someone Else"
        ]
    },
    {
        question:"What is your legal first name?",
        type:"entry"
    },
    {
        question:"What is your legal last name?",
        type:"entry"
    },
    {
        question:"What is your age?",
        type:"entry"
    },
    {
        question:"What is your household's gross monthly income?",
        type:"entry"
    },
    {
        question:"What is your household size?",
        type:"select",
        options:[
            1,
            2,
            3,
            4,
            "5+"
        ]
    }
]

export default inputs_template