; SAHNA OVOZI — Windows o'rnatuvchisi (Inno Setup 6) · Azimxodjayev Music
; AZ MUS o'rnatuvchisi tuzilishida: Program Files\Azimxodjayev Music\Sahna Ovozi,
; ish stoli yorlig'i, .sahna fayllar dasturga bog'lanadi.
#ifndef AppVer
  #define AppVer "1.0.0"
#endif
#define Root "..\..\build\Sahna Ovozi-win32-x64"

[Setup]
AppId={{6B1E2A47-3C2D-4F7E-9A51-5A0D7C9E3B21}
AppName=Sahna Ovozi
AppVersion={#AppVer}
AppVerName=Sahna Ovozi {#AppVer}
AppPublisher=Azimxodjayev Music
AppCopyright=Azimxodjayev Music
DefaultDirName={autopf}\Azimxodjayev Music\Sahna Ovozi
DefaultGroupName=Azimxodjayev Music
OutputBaseFilename=Sahna-Ovozi-{#AppVer}-Setup
SetupIconFile=..\..\Resources\icon.ico
UninstallDisplayIcon={app}\Sahna Ovozi.exe
UninstallDisplayName=Sahna Ovozi
Compression=lzma2/ultra
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64compatible
ArchitecturesAllowed=x64compatible
ChangesAssociations=yes
WizardStyle=modern
DisableProgramGroupPage=yes
CloseApplications=yes

[Languages]
Name: "uz"; MessagesFile: "compiler:Default.isl"

[Messages]
WelcomeLabel1=Sahna Ovozi o'rnatuvchisi
WelcomeLabel2=Teatr va dublaj uchun jonli ovoz pulti — Azimxodjayev Music.%n%nDavom etish uchun "Next" tugmasini bosing.
FinishedHeadingLabel=Sahna Ovozi o'rnatildi
FinishedLabel=Dastur Pusk menyusi va ish stolidan ochiladi. Baza: Hujjatlar\Sahna Ovozi.

[Tasks]
Name: "desktopicon"; Description: "Ish stolida yorliq yaratish"; GroupDescription: "Qo'shimcha:"

[Files]
Source: "{#Root}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\Sahna Ovozi"; Filename: "{app}\Sahna Ovozi.exe"
Name: "{autodesktop}\Sahna Ovozi"; Filename: "{app}\Sahna Ovozi.exe"; Tasks: desktopicon

[Registry]
Root: HKA; Subkey: "Software\Classes\.sahna"; ValueType: string; ValueName: ""; ValueData: "SahnaOvozi.Project"; Flags: uninsdeletevalue
Root: HKA; Subkey: "Software\Classes\SahnaOvozi.Project"; ValueType: string; ValueName: ""; ValueData: "Sahna Ovozi loyihasi"; Flags: uninsdeletekey
Root: HKA; Subkey: "Software\Classes\SahnaOvozi.Project\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\Sahna Ovozi.exe,0"
Root: HKA; Subkey: "Software\Classes\SahnaOvozi.Project\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\Sahna Ovozi.exe"" ""%1"""

[Run]
Filename: "{app}\Sahna Ovozi.exe"; Description: "Sahna Ovozi'ni ishga tushirish"; Flags: nowait postinstall skipifsilent
