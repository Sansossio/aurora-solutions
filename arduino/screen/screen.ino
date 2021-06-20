// include the library code:
#include <LiquidCrystal.h>

#define tempPin 0

// initialize the library with the numbers of the interface pins
LiquidCrystal lcd(7, 8, 9, 10, 11, 12);

const String DEFAULT_MESSAGE = "No events";
String lastMessage = "";
String inData;

void setup()
{
  Serial.begin(9600);
  lcd.begin(16, 2);
  lcd.setCursor(0, 1);
  lcd.print(DEFAULT_MESSAGE);
}

void setTemperature()
{
  int tempReading = analogRead(tempPin);
  // This is OK
  double tempK = log(10000.0 * ((1024.0 / tempReading - 1)));
  tempK = 1 / (0.001129148 + (0.000234125 + (0.0000000876741 * tempK * tempK)) * tempK); //  Temp Kelvin
  float tempC = tempK - 273.15;                                                          // Convert Kelvin to Celcius
  lcd.setCursor(0, 0);
  lcd.print("Temp         C  ");
  lcd.setCursor(6, 0);
  lcd.print(tempC);
  delay(500);
}

void loop()
{
  while (Serial.available() > 0)
  {
    char recieved = Serial.read();
    inData += recieved;

    // Process message when new line character is recieved
    if (recieved == '\n')
    {
      inData.trim();
      Serial.println(inData);
      if (inData == "")
      {
        inData = DEFAULT_MESSAGE;
      }
      if (lastMessage != inData)
      {
        lastMessage = inData;
        lcd.setCursor(0, 1);
        lcd.print(inData);
        lcd.print("                 ");
      }
      inData = "";
    }
  }
  setTemperature();
}
