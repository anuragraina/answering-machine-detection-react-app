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

function Transcript({ transcripts, transcriptInEmail, user }) {
	const classes = useStyles();
	const name = transcriptInEmail ? user.name : 'Anonyms';
	const badgeName = name
		.split(/\s/)
		.reduce((response, word) => (response += word.slice(0, 1)), '');

	return (
		<Paper variant={'outlined'} className={classes.paper}>
			<Typography variant={'h6'} style={{ marginBottom: 15, paddingBottom: 10 }}>
				Transcript
			</Typography>
			{transcripts && transcripts.length > 0 ? (
				transcripts.map(value => (
					<Card
						variant={'outlined'}
						style={{
							marginBottom: 5,
						}}
					>
						<CardHeader
							avatar={
								<Avatar aria-label='recipe' className={classes.avatar}>
									{badgeName}
								</Avatar>
							}
							title={name}
							subheader={value.timestamp}
						/>
						<CardContent style={{ paddingTop: 0 }}>
							<Typography variant={'caption'}>{value.text}</Typography>
						</CardContent>
					</Card>
				))
			) : (
				<Typography variant={'body1'} style={{ color: 'gray' }}>
					Transcripts will appear here ...
				</Typography>
			)}
		</Paper>
	);
}

export default Transcript;
