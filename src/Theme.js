import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
	palette: {
		primary: {
			main: '#1A1A1A',
		},
		secondary: {
			main: '#E3A019',
		},
	},
	root: {
		flexGrow: 1,
	},
	button: {},
	paper: {
		padding: 24,
	},
	typography: {
		fontFamily: 'Poppins',
		body1: {
			fontSize: '0.875rem',
		},
	},
});

export default theme;
