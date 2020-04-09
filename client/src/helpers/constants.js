export const GENDERS = ['MALE', 'FEMALE', 'F2M', 'M2F']
export const AUDIO_PREFS = ['CONVERSATION', 'MOANS', 'NO_AUDIO', 'CHAT_FIRST']
export const GENDER_COLORS = { MALE: '#1754ed', FEMALE: '#ff32be', F2M: '#18ecf3', M2F: '#ff1a1a' }
export const GENDER_DASHARRAY = { MALE: '800', FEMALE: '20 15', F2M: '10 20', M2F: '5 10' }
export const REPORT_TYPES = [
  { key: 'NONE', name: 'None', desc: "The other categories don't fit" },
  { key: 'UNDERAGE', name: 'Underage', desc: 'Appears younger than 18' },
  { key: 'NO_VIDEO', name: 'No Video', desc: 'Completely unable to see match' },
  { key: 'FALSE_AGE', name: 'False Age', desc: 'Appears a different age than entered, but is 18+' },
  { key: 'FALSE_SEX', name: 'False Sex', desc: 'Appears a different sex than entered' },
  { key: 'FALSE_AUDIO', name: 'False Audio', desc: "Didn't adhere to the agreed upon audio preference" },
  { key: 'ABUSIVE', name: 'Abusive', desc: 'Unwanted verbal threats or hate' },
]
