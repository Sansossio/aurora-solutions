// include the library code:
#include <LiquidCrystal.h>
#include <ArduinoJson.h>

#define tempPin 0
#define motionPin 2

// initialize the library with the numbers of the interface pins
LiquidCrystal lcd(7, 8, 9, 10, 11, 12);

const String DEFAULT_MESSAGE = "No events";
String lastMessage = "";
String inData;

void setup()
{
  Serial.begin(115200);

  pinMode(tempPin, INPUT);
  pinMode(motionPin, INPUT);

  lcd.begin(16, 2);
  lcd.setCursor(0, 1);
  lcd.print(DEFAULT_MESSAGE);
}

void sendDeviceType(String type)
{
  DynamicJsonDocument doc(15);
  doc["type"] = type;
  String json;
  serializeJson(doc, json);
  Serial.println(json);
}

void printFromSerial()
{
  while (Serial.available() > 0)
  {
    delay(3);
    char recieved = Serial.read();
    inData += recieved;

    // Process message when new line character is recieved
    if (recieved == '\n')
    {
      inData.trim();

      if (inData == "GET_TYPE") {
        sendDeviceType("SCREEN");
        inData = "";
        return;
      }

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

void motionSensor()
{
  int motion = digitalRead(motionPin);
  Serial.println(motion);
  String text = "No movement";

  if (motion == 1)
  {
    text = "Motion detected";
  }

  lcd.setCursor(0, 1);
  if (lastMessage != text)
  {
    lcd.print(text);
    lcd.print("      ");
    lastMessage = text;
  }
}

void loop()
{
  printFromSerial();
  setTemperature();
}
