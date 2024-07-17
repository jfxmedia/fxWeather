# fxWeather

fxWeather is a web application I built using HTML, CSS, and JavaScript. My goal was to use purely vanilla code without libraries, other than Fontawesome.
It provides weather forecasts locally and abroad with digested data from the free-use open-meteo.com API.
I use two APIs in this project, one based on latitude and longitude to find a location, and another to get the object based on these variables. This project will be an ongoing project as I am always coming up with new features I want to add, with the goal of publishing it on mobile app stores as a free weather app alternative!

## Features
- **Current Weather:** Displays current weather conditions.
- **Weather Forecast:** Provides a 5-day weather forecast.
- **Weather Alarms:** Allows users to set alarms for specific weather conditions.

## Getting Started

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/)

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/jfxmedia/fxWeather.git
    ```
2. Navigate to the project directory:
    ```sh
    cd fxWeather
    ```
3. Install dependencies:
    ```sh
    npm install
    ```

### Usage

1. Run the application:
    ```sh
    npm start
    ```
2. Open your browser and navigate to `http://localhost:3000`

## Project Structure
- `index.html`: Main HTML file.
- `style.css`: Main CSS file.
- `index.js`: Main JavaScript file.
- `images/`: Directory for images.

## Scripts
- `index.js`: Contains JavaScript functions for fetching weather data, displaying weather information, and handling alarms.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- open-meteo API for providing weather data.
- [Font Awesome](https://fontawesome.com/) for the icons.

## Contact

Feel free to reach out at [jesf777@gmail.com](mailto:jesf777@gmail.com) for any questions or feedback.
