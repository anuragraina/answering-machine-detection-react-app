import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	paper: {
		padding: theme.spacing(3),
		marginTop: theme.spacing(2),
	},
}));

function Transcript({ transcripts }) {
	const classes = useStyles();

	return (
		<Paper variant={'outlined'} className={classes.paper}>
			<Typography variant={'h6'} style={{ marginBottom: 15, paddingBottom: 10 }}>
				Transcript
			</Typography>
			<Card variant='outlined'>
				<CardHeader
					avatar={
						<Avatar aria-label='recipe' className={classes.avatar}>
							R
						</Avatar>
					}
					title={'Anonyms'}
					subheader='September 14, 2016'
				/>
			</Card>
		</Paper>
	);
}

export default Transcript;
