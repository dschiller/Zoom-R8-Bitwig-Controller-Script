
loadAPI(1);

host.defineController("Zoom", "Zoom R8", "1.0", "e5559d80-bf02-11e3-b1b6-0800200c9a66");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["ZOOM R8"], ["ZOOM R8"]);

var index;                         // Used for register the Midi CC
var LOWEST_CC = 0;                 // Lowest possible CC Controller
var HIGHEST_CC = 512;              // Highest possible CC Controller
var application;                   // Used for Bitwig's GUI Commands which are assigned to R8
var zoomFunction = false;          // Used for toggling the Zoom Function - Use R8's F1 Button for Zoom
var trackControlsBank = 1;         // Used for Track Controlls Bank Switching - Use R8's F2 BUtton to cycle the Banks
var maxTrackControlBanks = 3;      // Max. Banks - Change this if you need more Banks
                                   // Each Bank has 9 Faders (8 Fader + Master Fader) and 8 Buttons
// Copy this File to
// Windows: %USERPROFILE%\Documents\Bitwig Studio\Controller Scripts\
// Mac and Linux: ~/Bitwig Studio/Controller Scripts/

function init()
{
   application = host.createApplication();
   transport = host.createTransport();
   arranger = host.createArranger(0);

   host.getMidiOutPort(0).setShouldSendMidiBeatClock;
   host.getMidiInPort(0).setMidiCallback(onMidi);
   host.getMidiInPort(0).setSysexCallback(onSysex);

   // Make CCs 0-512 freely mappable for all 16 Channels
   userControls = host.createUserControlsSection((HIGHEST_CC - LOWEST_CC + 1)*16); 

   host.showPopupNotification('Zoom R8 initialized');
}

function onMidi(status, data1, data2)
{
    println("");
    println("CC " + status + " CH " + MIDIChannel(status) + " D1 " + data1 + " D2 " + data2);
	 
   // Register Midi Controllers
   if (data2 >= LOWEST_CC && data2 <= HIGHEST_CC)
   {
      // Check if it is a Fader
      if(status >= 224 && status <= 232)
      {
         index = status - LOWEST_CC + (HIGHEST_CC * MIDIChannel(status) + trackControlsBank);
         userControls.getControl(index).set(data2, 128);
      }

      // Check if it is a Button
      if(status == 144)
      {
         index = data1 - LOWEST_CC + (HIGHEST_CC * MIDIChannel(status) + trackControlsBank);
         userControls.getControl(index).set(data2, 128);
      }

      // Controller Assignment Labels for the Studio I/O Tab in Bitwig

      if(status == 224) userControls.getControl(index).setLabel("Fader 1 (B" + trackControlsBank + ")"); // Fader 1
      if(status == 225) userControls.getControl(index).setLabel("Fader 2 (B" + trackControlsBank + ")"); // Fader 2
      if(status == 226) userControls.getControl(index).setLabel("Fader 3 (B" + trackControlsBank + ")"); // Fader 3
      if(status == 227) userControls.getControl(index).setLabel("Fader 4 (B" + trackControlsBank + ")"); // Fader 4
      if(status == 228) userControls.getControl(index).setLabel("Fader 5 (B" + trackControlsBank + ")"); // Fader 5
      if(status == 229) userControls.getControl(index).setLabel("Fader 6 (B" + trackControlsBank + ")"); // Fader 6
      if(status == 230) userControls.getControl(index).setLabel("Fader 7 (B" + trackControlsBank + ")"); // Fader 7
      if(status == 231) userControls.getControl(index).setLabel("Fader 8 (B" + trackControlsBank + ")"); // Fader 8
      if(status == 232) userControls.getControl(index).setLabel("Master-Fader (B" + trackControlsBank + ")"); // Master Fader

      if(status == 144 && data1 == 8)  userControls.getControl(index).setLabel("Button 1 (B" + trackControlsBank + ")"); // Button 1
      if(status == 144 && data1 == 9)  userControls.getControl(index).setLabel("Button 2 (B" + trackControlsBank + ")"); // Button 2
      if(status == 144 && data1 == 10) userControls.getControl(index).setLabel("Button 3 (B" + trackControlsBank + ")"); // Button 3
      if(status == 144 && data1 == 11) userControls.getControl(index).setLabel("Button 4 (B" + trackControlsBank + ")"); // Button 4
      if(status == 144 && data1 == 12) userControls.getControl(index).setLabel("Button 5 (B" + trackControlsBank + ")"); // Button 5
      if(status == 144 && data1 == 13) userControls.getControl(index).setLabel("Button 6 (B" + trackControlsBank + ")"); // Button 6
      if(status == 144 && data1 == 14) userControls.getControl(index).setLabel("Button 7 (B" + trackControlsBank + ")"); // Button 7
      if(status == 144 && data1 == 15) userControls.getControl(index).setLabel("Button 8 (B" + trackControlsBank + ")"); // Button 8

   }

   /*
    * Assign static Controls to GUI
    */

   // Play
   if(status == 144 && data1 == 94 && data2 == 127) 
   {
      transport.togglePlay();
      //host.showPopupNotification("Play");
      println("Toggle Play");
   }

   // Stop
   if(status == 144 && data1 == 93 && data2 == 127) 
   {
      transport.stop();
      //host.showPopupNotification("Stop");
      println("Stop");
   }

   // Enable Zoom Function
   if(status == 144 && data1 == 54 && data2 == 127) 
   {
      zoomFunction = true;
      host.showPopupNotification("Zoom");
      println("Zoom on");
   }

   // Disable Zoom Function
   if(status == 144 && data1 == 54 && data2 == 0) 
   {
      zoomFunction = false;
      //host.showPopupNotification("Zoom off");
      println("Zoom off");
   }

   // Check if not Zoom is inactive
   if(!zoomFunction) 
   {

      // Scrub Forward
      if(status == 176 && data1 == 60 && data2 == 1) 
      {
         transport.incPosition(1.0, true);
         //host.showPopupNotification("..>");
         println("Scrub Forward");
      }

      // Scrub Backward
      if(status == 176 && data1 == 60 && data2 == 65) 
      {
         transport.incPosition(-1.0, true);
         //host.showPopupNotification("<..");
         println("Scrub Backward");
      }

   }

   // Check if not Zoom is active
   if(zoomFunction) 
   {

      // Zoom in
      if(status == 176 && data1 == 60 && data2 == 1) 
      {
         application.zoomIn();
         //host.showPopupNotification("Zoom +");
         println("Zoom in");
      }

      // Zoom out
      if(status == 176 && data1 == 60 && data2 == 65) 
      {
         application.zoomOut();
         //host.showPopupNotification("Zoom -");
         println("Zoom out");
      }

   }

   // Switch Track Control Banks
   if(status == 144 && data1 == 55 && data2 == 127) 
   {

      println("Switch Track Control Banks");

      for(i=1; i<maxTrackControlBanks; i++)
      {
         if(trackControlsBank == i) 
         {
            trackControlsBank = i+1;
            host.showPopupNotification("Bank " + trackControlsBank);
            println("Bank " + trackControlsBank + " / " + maxTrackControlBanks);
            return;
         }

      }

      if(trackControlsBank == maxTrackControlBanks) 
      {
         trackControlsBank = 1;
         host.showPopupNotification("Bank " + trackControlsBank);
         println("Bank " + trackControlsBank + " / " + maxTrackControlBanks);
         return;
      }

   }

   // FastForward
   if(status == 144 && data1 == 92 && data2 == 127) 
   {
      transport.fastForward();
      //host.showPopupNotification(">>");
      println("FastForward");
   }

   // Rewind
   if(status == 144 && data1 == 91 && data2 == 127) 
   {
      transport.rewind();
      //host.showPopupNotification("<<");
      println("Rewind");
   }

   // Toggle Marker Visibility
   if(status == 144 && data1 == 58 && data2 == 127)
   {
      //TODO: Add / Clear Marker
   }  

   // Next Marker
   if(status == 144 && data1 == 57 && data2 == 127)
   {
      //arranger.nextMarker(); //TODO: whats the API Method for this ?
   }   

   // Cursor Left
   if(status == 144 && data1 == 98 && data2 == 127)
   {
      application.arrowKeyLeft();
      println("Left");
   } 

   // Cursor Right
   if(status == 144 && data1 == 99 && data2 == 127)
   {
      application.arrowKeyRight();
      println("Right");
   } 

   // Cursor Down
   if(status == 144 && data1 == 97 && data2 == 127)
   {
      application.arrowKeyDown();
      println("Down");
   } 

   // Cursor Up
   if(status == 144 && data1 == 96 && data2 == 127)
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
