// include the library code:
#include <LiquidCrystal.h>

// initialize the library with the numbers of the interface pins
LiquidCrystal lcd(7, 8, 9, 10, 11, 12);

const String DEFAULT_MESSAGE = "No events";
String lastMessage = "";
String inData;

void setup()
{
  Serial.begin(9600);
  lcd.begin(16, 2);
  lcd.print(DEFAULT_MESSAGE);
}

void loop()
{
  while (Serial.available() > 0)
  {
    delay(50);
    char recieved = Serial.read();
    inData += recieved;

    // Process message when new line character is recieved
    if (recieved == '\n')
    {
      inData.trim();
      if (inData == "") {
        inData = DEFAULT_MESSAGE;
      }
      if (lastMessage != inData)
      {
        lastMessage = inData;
        lcd.clear();
        lcd.print(inData);
      }
      inData = "";
    }
  }
}
