// Copy this File to:
// Windows: %USERPROFILE%\Documents\Bitwig Studio\Controller Scripts\
// Mac and Linux: ~/Bitwig Studio/Controller Scripts/

loadAPI(1);

host.defineController("Zoom", "Zoom R8", "1.1", "a2559d80-af12-11e3-b2b6-0800200c9a66");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["ZOOM R8"], ["ZOOM R8"]);

/*
 * Declarations
 */

// Registering Midi Controllers

var index;                         // Used to register the Midi CC
var LOWEST_CC = 0;                 // Lowest possible CC Controller
var HIGHEST_CC = 512;              // Highest possible CC Controller

// Bitwig's System Sections

var application;                   // Used for Bitwig's GUI Commands which are assigned to R8
var transport;                     // Used for Bitwig's GUI Commands which are assigned to R8
var arranger;                      // Used for Bitwig's GUI Commands which are assigned to R8

// Modes

var zoomFunction = false;          // Used for toggling the Zoom Function - Use R8's F1 Button for Zoom
var bankFunction = false;          // Used to go back the Banks

// Bank Function

var status;                        // Used to go back the Banks
var data1;                         // Used to go back the Banks
var data2;                         // Used to go back the Banks
var bank = 1;                      // Used for Bank Switching - Use R8's F2 Button to cycle the Banks forward
                                   // Use R8's F2 + F1 Buttons to cycle the Banks backward
var maxBanks = 3;                  // Max. Banks - Change this if you need more Banks
                                   // Each Bank has 9 Faders (8 Faders + Master-Fader) and 8 Buttons

/*
 * Constants
 */

// Buttons

function button1()                        { if(status == 144 && data1 == 8)  return true; return false; }
function button2()                        { if(status == 144 && data1 == 9)  return true; return false; }
function button3()                        { if(status == 144 && data1 == 10) return true; return false; }
function button4()                        { if(status == 144 && data1 == 11) return true; return false; }
function button5()                        { if(status == 144 && data1 == 12) return true; return false; }
function button6()                        { if(status == 144 && data1 == 13) return true; return false; }
function button7()                        { if(status == 144 && data1 == 14) return true; return false; }
function button8()                        { if(status == 144 && data1 == 15) return true; return false; }

function buttonF1()                       { if(status == 144 && data1 == 54) return true; return false; }
function buttonF2()                       { if(status == 144 && data1 == 55) return true; return false; }

function buttonPlay()                     { if(status == 144 && data1 == 94) return true; return false; }
function buttonStop()                     { if(status == 144 && data1 == 93) return true; return false; }
function buttonFastForward()              { if(status == 144 && data1 == 92) return true; return false; }
function buttonRewind()                   { if(status == 144 && data1 == 91) return true; return false; }

function buttonMarkerAddClear()           { if(status == 144 && data1 == 58) return true; return false; }
function buttonMarkerNext()               { if(status == 144 && data1 == 57) return true; return false; }
function buttonMarkerPrevious()           { if(status == 144 && data1 == 56) return true; return false; }

function buttonLeft()                     { if(status == 144 && data1 == 98) return true; return false; }
function buttonRight()                    { if(status == 144 && data1 == 99) return true; return false; }
function buttonDown()                     { if(status == 144 && data1 == 97) return true; return false; }
function buttonUp()                       { if(status == 144 && data1 == 96) return true; return false; }

function jogWheelRotateClockwise()        { if(status == 176 && data1 == 60 && data2 == 1)  return true; return false; }
function jogWheelRotateCounterclockwise() { if(status == 176 && data1 == 60 && data2 == 65) return true; return false; }

// Faders

function fader1()      { if(status == 224) return true; return false; }
function fader2()      { if(status == 225) return true; return false; }
function fader3()      { if(status == 226) return true; return false; }
function fader4()      { if(status == 227) return true; return false; }
function fader5()      { if(status == 228) return true; return false; }
function fader6()      { if(status == 229) return true; return false; }
function fader7()      { if(status == 230) return true; return false; }
function fader8()      { if(status == 231) return true; return false; }
function masterFader() { if(status == 232) return true; return false; }

// Conditions

function isFader()    { if(status >= 224 && status <= 232) return true; return false; }
function isButton()   { if(status == 144) return true; return false; }
function isPressed()  { if(data2  == 127) return true; return false; }
function isReleased() { if(data2  == 0)   return true; return false; }

// Init Function will be executed if the Controller is added to Bitwig

function init()
{
   application = host.createApplication();
   transport   = host.createTransport();
   arranger    = host.createArranger(0);

   host.getMidiOutPort(0).setShouldSendMidiBeatClock;

   // Acticate Callback Function to be able to listen to MIDI Signals comming from R8

   host.getMidiInPort(0).setMidiCallback(onMidi);

   // Acticate Callback Function to be able to listen to MIDI Signals (Sysex) comming from R8

   host.getMidiInPort(0).setSysexCallback(onSysex);

   // Make CCs 0-512 freely mappable for all 16 Channels

   userControls = host.createUserControlsSection((HIGHEST_CC - LOWEST_CC + 1)*16); 

   host.showPopupNotification('Zoom R8 initialized');
}

// onMidi Function will be executed each Time a MIDI Signal will be send from R8 to Bitwig

function onMidi(status, data1, data2)
{
   this.status = status;
   this.data1  = data1;
   this.data2  = data2;

   /* 
    * Debugging
    *
    * Print MIDI Signals comming from R8 to Bitwig on Bitwig's Controller Script Console 
    * (In Bitwig > Menu "View" > "Show Control Script Console" > Select "Zoom R8.controls.js")
    *
    * Use Command "restart" in the Console to Reload the Script if you changed something
    *
    */

   println("");
   println("CC " + status + " CH " + MIDIChannel(status) + " D1 " + data1 + " D2 " + data2);
    
   // Register Midi Controllers

   if (data2 >= LOWEST_CC && data2 <= HIGHEST_CC)
   {
      // If it is a Fader register the Fader

      if(isFader())
      {
         index = status - LOWEST_CC + (HIGHEST_CC * MIDIChannel(status) + bank);
         userControls.getControl(index).set(data2, 128);
      }

      // If it is a Button register the Button

      if(isButton())
      {
         index = data1 - LOWEST_CC + (HIGHEST_CC * MIDIChannel(status) + bank);
         userControls.getControl(index).set(data2, 128);
      }

      // Set Controller Assignment Labels for the "Studio I/O" Tab in Bitwig

      if(fader1())           userControls.getControl(index).setLabel("Fader 1 (B" + bank + ")"); // Fader 1
      if(fader2())           userControls.getControl(index).setLabel("Fader 2 (B" + bank + ")"); // Fader 2
      if(fader3())           userControls.getControl(index).setLabel("Fader 3 (B" + bank + ")"); // Fader 3
      if(fader4())           userControls.getControl(index).setLabel("Fader 4 (B" + bank + ")"); // Fader 4
      if(fader5())           userControls.getControl(index).setLabel("Fader 5 (B" + bank + ")"); // Fader 5
      if(fader6())           userControls.getControl(index).setLabel("Fader 6 (B" + bank + ")"); // Fader 6
      if(fader7())           userControls.getControl(index).setLabel("Fader 7 (B" + bank + ")"); // Fader 7
      if(fader8())           userControls.getControl(index).setLabel("Fader 8 (B" + bank + ")"); // Fader 8
      if(masterFader()) userControls.getControl(index).setLabel("Master-Fader (B" + bank + ")"); // Master Fader

      if(button1()) userControls.getControl(index).setLabel("Button 1 (B" + bank + ")"); // Button 1
      if(button2()) userControls.getControl(index).setLabel("Button 2 (B" + bank + ")"); // Button 2
      if(button3()) userControls.getControl(index).setLabel("Button 3 (B" + bank + ")"); // Button 3
      if(button4()) userControls.getControl(index).setLabel("Button 4 (B" + bank + ")"); // Button 4
      if(button5()) userControls.getControl(index).setLabel("Button 5 (B" + bank + ")"); // Button 5
      if(button6()) userControls.getControl(index).setLabel("Button 6 (B" + bank + ")"); // Button 6
      if(button7()) userControls.getControl(index).setLabel("Button 7 (B" + bank + ")"); // Button 7
      if(button8()) userControls.getControl(index).setLabel("Button 8 (B" + bank + ")"); // Button 8

   }

   /*
    * Assign static Controls to GUI
    */

   // Play

   if(buttonPlay() && isPressed()) 
   {
      transport.togglePlay();
      //host.showPopupNotification("Toggle Play");
      println("Toggle Play"); 
   }

   // Stop

   if(buttonStop() && isPressed()) 
   {
      transport.stop();
      //host.showPopupNotification("Stop");
      println("Stop");
   }

   // Enable Zoom Function

   if(buttonF1() && isPressed()) 
   {
      zoomFunction = true;
      host.showPopupNotification("Zoom");
      println("Zoom on");
   }

   // Disable Zoom Function

   if(buttonF1() && isReleased()) 
   {
      zoomFunction = false;
      //host.showPopupNotification("Zoom off");
      println("Zoom off");
   }

   // If Zoom is inactive execute Scrub Function with Jog Wheel

   if(!zoomFunction) 
   {

      // Scrub Forward

      if(jogWheelRotateClockwise()) 
      {
         transport.incPosition(1.0, true);
         //host.showPopupNotification("..>");
         println("Scrub Forward");
      }

      // Scrub Backward
      if(jogWheelRotateCounterclockwise()) 
      {
         transport.incPosition(-1.0, true);
         //host.showPopupNotification("<..");
         println("Scrub Backward");
      }

   }

   // If Zoom is active execute Zoom Function with Jog Wheel

   if(zoomFunction) 
   {

      // TODO: Maybe a Bug: Arrangement must be focused

      // Zoom in

      if(jogWheelRotateClockwise()) 
      {
         application.zoomIn();
         //host.showPopupNotification("Zoom +");
         println("Zoom in");
      }

      // Zoom out

      if(jogWheelRotateCounterclockwise()) 
      {
         application.zoomOut();
         //host.showPopupNotification("Zoom -");
         println("Zoom out");
      }

   }

   // Navigate Banks forward

   if(!zoomFunction) 
   {
      if(buttonF2() && isPressed()) 
      {

         println("Switch Track Control Banks");

         bankFunction = true;

         for(i=1; i<maxBanks; i++)
         {
            if(bank == i) 
            {
               bank = i+1;
               host.showPopupNotification("Bank " + bank);
               println("Bank " + bank + " / " + maxBanks);
               return;
            }

         }

         if(bank == maxBanks) 
         {
            bank = 1;
            host.showPopupNotification("Bank " + bank);
            println("Bank " + bank + " / " + maxBanks);
            return;
         }

      }

      if(buttonF2() && isReleased()) bankFunction = false;
   }

   // Navigate Banks backward

   if(bankFunction)
   {
      println("Switch Track Control Banks");

      if(buttonF1() && isPressed()) 
      {
         for(i=maxBanks; i>1; i--)
         {
            if(bank == i) 
            {
               bank = i-1;
               host.showPopupNotification("Bank " + bank);
               println("Bank " + bank + " / " + maxBanks);
               return;
            }

         }

         if(bank == 1) 
         {
            bank = maxBanks;
            host.showPopupNotification("Bank " + bank);
            println("Bank " + bank + " / " + maxBanks);
            return;
         }
      }
   }

   // Zoom to Fit

   if(zoomFunction)  
   {
      if(buttonF2() && isPressed()) 
      {
         application.zoomToFit();
         host.showPopupNotification("Zoom to Fit");
         println("Zoom to Fit");
      }
   }

   // FastForward

   if(buttonFastForward() && isPressed()) 
   {
      transport.fastForward();
      //host.showPopupNotification(">>");
      println("FastForward");
   }

   // Rewind

   if(buttonRewind() && isPressed()) 
   {
      transport.rewind();
      //host.showPopupNotification("<<");
      println("Rewind");
   }

   // Add / Clear Marker

   if(buttonMarkerAddClear() && isPressed())
   {
      // TODO: Add / Clear Marker
   }  

   // Next Marker

   if(buttonMarkerNext() && isPressed())
   {
      //arranger.nextMarker(); // TODO: What's the API Method for this ?
   }  

   // Previous Marker

   if(buttonMarkerPrevious() && isPressed())
   {
      //arranger.previousMarker(); // TODO: What's the API Method for this ?
   }   

   // Cursor Left

   if(buttonLeft() && isPressed())
   {
      application.arrowKeyLeft();
      println("Left");
   } 

   // Cursor Right

   if(buttonRight() && isPressed())
   {
      application.arrowKeyRight();
      println("Right");
   } 

   // Cursor Down

   if(buttonDown() && isPressed())
   {
      application.arrowKeyDown();
      println("Down");
   } 

   // Cursor Up

   if(buttonUp() && isPressed())
   {
      application.arrowKeyUp();
      println("Up");
   }

}

function onSysex(data)
{
   printSysex(data);
}

function exit() {}
