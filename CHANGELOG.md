# Changelog

## 2025-05-28

It's been a while since the last update, huh? While this project may no longer be updated, I changed up the bits to make it work on both local and live environments.

Also, as a result of Glitch.com shutting down this July. This project's new home is now on Netlify at coffee-os.netlify.app. Enjoy!

- Moved the live site from Glitch to Netlify
- Organized the project structure a tad bit
- Changed all icons paths to a new icon theme structure
- Fixed all file paths to work on both local and live environments
- Fixed the home directory naming (oops)
- Classic mode now use resources locally
- Refactored and removed unnecessary files

## 2022-07-01

- Added window unfocused state
- Added app titles in panel (can only be enabled by custom themes)
- Added two (2) commands:
  - `reboot`
  - `help`
- Improved Win95 custom theme

## 2022-06-30

- Added maximize and minimize buttons (yeah...)
- Added two (2) components:
  - Toast
  - List
- Added one (1) built-in custom theme:
  - `css/custom/breeze.css` (light and dark variants)
- Changed Duke Nukem (`dknk`) to Emulator (`emu`)
  - Now supports many games
- Added four (4) stock wallpapers in Appearance page made by KDE
- Added SOP toast to Browser (`web`)
- Re-adjused panel icons
- Updated some custom themes
- Mocha stylesheet improvements

## 2022-06-25

- Added support for custom themes
  - Three (3) built-in custom themes:
    - `css/custom/win11.css` (light and dark variants)
    - `css/custom/win95.css` (light variant only)
    - `css/custom/mac12.css` (dark variant only)
  - Type one of them in the input box to try it out
  - You can also use any user-uploaded themes
  - Leave it blank to use the default theme
  - Only supports CSS files
- Custom fonts as well
- You can now resize the canvas in Paint

## 2022-06-18

- Added one (1) app:
  - Paint (`paint`)
- Added jqScribble as JS dependency
- Added bold variant of Fira Sans (bruh)
- You can now create folders in File Manager
- Mocha is now its own stylesheet

## 2022-06-17

- Added the ability to load images in Image Viewer
- You can now create new folders in the desktop
- You can now open Markdown files in File Manager
- Added 'Image Viewer' to the app drawer
- Images viewed through Image Viewer now scale properly
- The height of window decorations is now smaller
- Numerous UI improvements thanks to Mocha
- Some improvements and fixes

## 2022-06-16

- New experimental "Mocha" widget toolkit
  - All forms and controls will become more consistent
  - Heavily uses CSS classes to streamline code
  - Easier to maintain
  - All existing apps will be converted to utilize Mocha
- Changed 'Appearance' to 'Settings'
  - Added settings sidebar
  - Added account settings
- Revamped app drawer
- Improved terminal prompt
- Fixed window priority system not working with minimized windows
- Some improvements and fixes

## 2022-06-14

- New appearance options:
  - Light and dark themes
  - Accent colors
  - Background presets
  - Custom backgrounds
- Added lock screen
- Power options
- Volume indicator
- LocalStorage support
  - Only appearance settings are saved for now
- Changelog!
- Some improvements and fixes

## 2022-06-13

- Merged CoffeeOS dev (local) branch to stable (glitch) branch
- Added three (3) apps:
  - File manager (`files`)
  - Image viewer (`image`)
  - Playground (`playground`)
- Added three (3) commands:
  - `image`
  - `pin`
  - `unpin`
- Revamped introduction window
- Desktop icons
- Desktop context menu
- You can now minimize windows
- New window animations
- Improved window priority system
- Improved icon dragging
- New app icons for:
  - Appearance (formerly _Change Background_)
  - Duke Nukem
- Changed 'Web' to 'Browser'
- Removed app 'References'
- Some improvements and fixes

## 2022-05-24

- Added one (1) Playground feature:
  - Console
- `color-scheme` support
- Some improvements and fixes

## 2022-05-22

- Added one (1) terminal command:
  - `history`
- Some improvements and fixes

## 2022-05-20 (dev)

- Added one (1) app:
  - Playground
- You can now minimize windows
- New window animations
- Improved window priority system
- Improved icon dragging
- Some improvements and fixes

## 2022-05-18

- Changed maximize handle to window CSD only
- Changed text editor's rename input to editable span
- Removed app 'Introduction' from pinned shortcuts

## 2022-05-17

- Added three (3) terminal commands:
  - `ls`
  - `mkdir`
  - `rm`
- Basic folder listing
- Basic command history system
- Some improvements and fixes

## 2022-05-16

- Improved colors for balance and contrast
- Changed 'Visual Studio Code' to 'Code'

## 2022-05-15

- Added one (1) app:
  - Web (`web`)
- Added four (4) terminal commands:
  - `exit`
  - `shutdown`
  - `coffee`
  - `rbg`
- Added app indicators
- Basic window priority system
- Some improvements and fixes

## 2022-05-14

- New Text Editor (`ed`) options:
  - You can now open text files, edit, and save them
  - Font size and word wrapping
  - Status bar with current line and column
  - Editable file name
- Added Web (in code only)
- Some improvements and fixes

## 2022-05-13

- You can now maximize windows
- Changed date and time format

## 2022-05-12

- Added two (2) apps:
  - VS Code
  - Duke Nukem (`dknk`)
- Backdrop filter support
- Some improvements and fixes

## 2022-05-11

- Added three (3) apps:
  - Terminal (`term`)
  - Run (`run`)
  - Change Background (`bgc`)
- Five (5) basic commands:
  - `clear`
  - `whoami`
  - `pwd`
  - `cat`
  - `neofetch`
- Window resize indicator
- Some improvements and fixes

## 2022-05-10

- First public release
