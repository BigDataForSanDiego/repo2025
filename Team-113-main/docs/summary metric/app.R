library(shiny)
library(ggplot2)
library(dplyr)
library(tidyr)
library(lubridate)
library(googlesheets4)

theme_set(theme_classic(base_size = 16) +
            theme(
              axis.title = element_text(face = "bold"),
              axis.text  = element_text(size = 13),
              plot.title = element_text(face = "bold", size = 20),
              panel.grid.major = element_line(size = 0.7, linetype = "dashed"),
              panel.grid.minor = element_line(size = 0.4, linetype = "dotted")
            )
)

ui <- fluidPage(
  titlePanel("Quick Dashboard"),
  tabsetPanel(
    tabPanel("Needs Summary", plotOutput("needs_chart")),
    tabPanel("Daily Registrations", plotOutput("timeline_chart"))
  )
)

server <- function(input, output) {
  # Load dataset
  data <- tryCatch(read.csv("Tidy.csv"), error = function(e) NULL)
  
  if (is.null(data)) {
    stop("Could not read Tidy.csv — please ensure it's in your working directory.")
  }
  
  # Define possible need columns
  possible_needs <- c("Housing","Place_to_Stay","Place to Stay","Transport","Benefits",
                      "Food_Water","Food/_Water","Healthcare","Support_Groups",
                      "Support Groups","Needs_to_talk","Needs to talk",
                      "Needs_Phone","Needs phone","Has_Q_A","Has Q&A")
  
  need_cols <- intersect(possible_needs, names(data))
  
  if (length(need_cols) == 0) {
    stop("No matching need columns found in your Tidy.csv file.")
  }
  
  # Convert needs columns to logical TRUE/FALSE
  data <- data %>%
    mutate(across(all_of(need_cols),
                  ~ tolower(as.character(.)) %in% c("true","t","yes","1")))
  
  # Summarize TRUE values for each need
  needs_summary <- data %>%
    summarise(across(all_of(need_cols), ~ sum(. == TRUE, na.rm = TRUE))) %>%
    pivot_longer(cols = everything(), names_to = "Need", values_to = "Count")
  
  # Needs Summary Bar Chart
  output$needs_chart <- renderPlot({
    ggplot(needs_summary, aes(x = Need, y = Count, fill = Need)) +
      geom_bar(stat = "identity") +
      labs(title = "Number of Declared Needs per Need Category",
           x = "Need Category", y = "Count") +
      theme_minimal() +
      theme(
        plot.title = element_text(face = "bold", size = 18, hjust = 0.5),
        axis.title.x = element_text(face = "bold", size = 14),
        axis.title.y = element_text(face = "bold", size = 14),
        axis.text.x = element_text(face = "bold", hjust = 1, size = 14),
        axis.text.y = element_text(face = "bold", size = 14),
        legend.position = "none"
      )
  })
  
  # Daily Registrations Line Chart
  output$timeline_chart <- renderPlot({
    req("Timestamp" %in% names(data))
    
    daily_data <- data %>%
      mutate(Timestamp = suppressWarnings(ymd_hms(Timestamp))) %>%
      filter(!is.na(Timestamp)) %>%
      mutate(Date = as.Date(Timestamp)) %>%
      group_by(Date) %>%
      summarise(Registrations = n()) %>%
      arrange(Date)
    
    ggplot(daily_data, aes(x = Date, y = Registrations)) +
      geom_line(color = "#0072B2", size = 1.2) +
      geom_point(color = "#0072B2", size = 2) +
      labs(title = "Individuals Registered per Day",
           x = "Date", y = "Number of Registrations") +
      theme_minimal() +
      theme(
        plot.title = element_text(face = "bold", size = 18, hjust = 0.5),
        axis.title.x = element_text(face = "bold", size = 14),
        axis.title.y = element_text(face = "bold", size = 14),
        axis.text.x = element_text(face = "bold", hjust = 1, size = 14),
        axis.text.y = element_text(face = "bold", size = 14)
      )
  })
}

shinyApp(ui, server)

