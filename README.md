The idea was to create an interactive website, where user can get an overview of H1B petitions number either for each 
each state or for each location during 2011-2016.

The data used in this app were taken from: https://www.kaggle.com/nsharan/h-1b-visa

The original data were preprocessed and cleaned: I split the column "Worksite" into "City" and "State" to make it possible 
group the data by states. Also all rows, which has NA values, were removed. The data were moved from a file into a database 
with a single table.

There was built a simple API based on Flask framework with SQLite database. The interface was created using Bootstrap. 
To create an interactive map based on data from API I used Leaflet library. The application was deployed on Heroku platform.

