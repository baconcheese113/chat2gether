import { createMuiTheme } from '@material-ui/core/styles'
import { createGlobalStyle } from 'styled-components'

export const darkTheme = {
  colorPrimary: '#9932cc',
  colorPrimaryLight: '#c38fdd',

  colorWhite1: '#aaa',

  colorGreyLight1: '#949494',
  colorGreyLight2: '#777',
  colorGreyLight3: '#555',

  colorGreyDark1: '#3f3f3f',
  colorGreyDark2: '#313131',
  colorGreyDark3: '#222',

  fontPrimary: 'K2D, sans-serif',
  fontSecondary: 'Megrim, cursive',
}

export const muiTheme = createMuiTheme({
  palette: {
    primary: {
      light: '#cd65ff',
      main: '#9932cc',
      dark: '#66009a',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
})

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 62.5%;
    font-family: 'K2D', sans-serif;
  }

  body {
    background-image: linear-gradient(#181818, #3f3f3f 30%);
    color: white;
    text-align: center;
  }
`

// gradientPrimaryBR: 'linear-gradient(to bottom right, ${p => p.theme.colorPrimary}, ${p => p.theme.colorGreyDark1})',
