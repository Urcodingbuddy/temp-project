import { useTheme } from '@mui/material'
import { ReactSVG } from 'react-svg'

// -----------SVG's----------------
import myPeegu from '../resources/images/svg/myPeegu.svg'
import eye from '../resources/images/svg/eye.svg'
import eyeHidden from '../resources/images/svg/eyeHidden.svg'
import linkExpired from '../resources/images/svg/linkExpired.svg'
import academicBlack from '../resources/images/svg/academicBlack.svg'
import counsellorBlack from '../resources/images/svg/counsellorBlack.svg'
import dashboardBlack from '../resources/images/svg/dashboardBlack.svg'
import initiationBlack from '../resources/images/svg/initiationBlack.svg'
import arrowDownBlack from '../resources/images/svg/arrowDownBlack.svg'
import dashboardBlue from '../resources/images/svg/dashboardBlue.svg'
import initiationBlue from '../resources/images/svg/initiationBlue.svg'
import counsellorBlue from '../resources/images/svg/counsellorBlue.svg'
import academicBlue from '../resources/images/svg/academicBlue.svg'
import arrowDownBlue from '../resources/images/svg/arrowDownBlue.svg'
import arrowUpBlue from '../resources/images/svg/arrowUpBlue.svg'
import dotBlue from '../resources/images/svg/dotBlue.svg'
import editPencilBlue from '../resources/images/svg/editPencilBlue.svg'
import alertCircle from '../resources/images/svg/alertCircle.svg'
import tickCircle from '../resources/images/svg/tickCircle.svg'
import toastError from '../resources/images/svg/toastError.svg'
import toastSuccess from '../resources/images/svg/toastSuccess.svg'
import search from '../resources/images/svg/search.svg'
import sliders from '../resources/images/svg/sliders.svg'
import eclipseRed from '../resources/images/svg/eclipseRed.svg'
import eclipseBlue from '../resources/images/svg/eclipseBlue.svg'
import eclipseGreen from '../resources/images/svg/eclipseGreen.svg'
import eclipsePurple from '../resources/images/svg/eclipsePurple.svg'
import frame from '../resources/images/svg/frame.svg'
import plusWhite from '../resources/images/svg/plusWhite.svg'
import cancelRounded from '../resources/images/svg/cancelRounded.svg'
import noSchoolsBlack from '../resources/images/svg/noSchoolsBlack.svg'
import wireBroken from '../resources/images/svg/wireBroken.svg'
import radioCheckedBlue from '../resources/images/svg/radioCheckedBlue.svg'
import radioUncheckedBlue from '../resources/images/svg/radioUncheckedBlue.svg'
import doneWhite from '../resources/images/svg/doneWhite.svg'
import man from '../resources/images/svg/man.svg'
import editPencilBlack from '../resources/images/svg/editPencilBlack.svg'
import deleteRed from '../resources/images/svg/deleteRed.svg'
import editPencilWhite from '../resources/images/svg/editPencilWhite.svg'
import minusRed from '../resources/images/svg/minusRed.svg'
import caretDown from '../resources/images/svg/DropDwon.svg'
import trashRed from '../resources/images/svg/trashRed.svg'
import descArrow from '../resources/images/svg/descArrow.svg'
import ascArrow from '../resources/images/svg/ascArrow.svg'
import checkedBoxBlue from '../resources/images/svg/checkedBoxBlue.svg'
import uncheckedBox from '../resources/images/svg/uncheckedBox.svg'
import academicRed from '../resources/images/svg/academicRed.svg'
import inActivateSchool from '../resources/images/svg/inActivateSchool.svg'
import calender from '../resources/images/svg/Calendar.svg'
import uploadYellow from '../resources/images/svg/uploadYellow.svg'
import caretSolidDown from '../resources/images/svg/caretSolidDown.svg'
import caretSolidRight from '../resources/images/svg/caretSolidRight.svg'
import clockBlack from '../resources/images/svg/Clock.svg'
import trashBlack from '../resources/images/svg/trashBlack.svg'
import menuDotsBlue from '../resources/images/svg/menuDotsBlue.svg'
import suggestionsArrow from '../resources/images/svg/suggestionsArrow.svg'
import redSquare from '../resources/images/svg/redSquare.svg'
import greenSquare from '../resources/images/svg/greenSquare.svg'
import yellowSquare from '../resources/images/svg/yellowSquare.svg'
import dashboardHeaderImage from '../resources/images/svg/dashboardHeaderImage.svg'
import view from '../resources/images/svg/view.svg'
import roundedLeftArrowGray from '../resources/images/svg/roundedLeftArrowGray.svg'
import roundedLeftArrowBlack from '../resources/images/svg/roundedLeftArrowBlack.svg'
import roundedRightArrowGray from '../resources/images/svg/roundedRightArrowGray.svg'
import roundedRightArrowBlack from '../resources/images/svg/roundedRightArrowBlack.svg'
import CarretDoubleRight from '../resources/images/svg/CaretDoubleRight.svg'
import CarretDoubleLeft from '../resources/images/svg/CaretDoubleLeft.svg'
import csvIcon from '../resources/images/svg/csvIcon.svg'
import arrowTopRight from '../resources/images/svg/arrow-top-right.svg'
import download from '../resources/images/svg/download .svg'
import downloadWhite from '../resources/images/svg/downloadWhite.svg'
import eclipseBlueStart from '../resources/images/svg/eclipseBlueStart.svg'
import eclipseBlueEnd from '../resources/images/svg/eclipseBlueEnd.svg'
import arrowTopRightWhite from '../resources/images/svg/arrowTopRightWhite.svg'
import groupBaseline from '../resources/images/svg/groupBaseline.svg'
import topThreeStars from '../resources/images/svg/topThreeStars.svg'
import unCheckedRound from '../resources/images/svg/unCheckedRound.svg'
import like from '../resources/images/svg/like .svg'
import assessmentBlack from '../resources/images/svg/assessmentBlack.svg'
import assessmentBlue from '../resources/images/svg/assessmentBlue.svg'
import dashboardPPT from '../resources/images/svg/dashboardPPT.svg'
import dashboardBook from '../resources/images/svg/dashboardBook.svg'
import errorFile from '../resources/images/svg/errorFile.svg'
import DeActivateIcon from '../resources/images/svg/DeActivateIcon.svg'
import alertOctagon from '../resources/images/svg/alertOctagon.svg'
import dropDown from '../resources/images/svg/dropDown.svg'
import uncheckRound from '../resources/images/svg/uncheckRound.svg'
import disabledCheckedRound from '../resources/images/svg/disabledCheckedRound.svg'
import schoolDetailsActionIcon from '../resources/images/svg/schoolDetailsActionIcon.svg'

import Edit from '../resources/images/svg/Edit.svg'
import Promote from '../resources/images/svg/Promote.svg'
import ShiftSection from '../resources/images/svg/ShiftSection.svg'
import graduation from '../resources/images/svg/graduation.svg'

import exit from '../resources/images/svg/exit.svg'
import promotBiggerIcon from '../resources/images/svg/promotBiggerIcon.svg'
import ActiveProperty from '../resources/images/svg/ActiveProperty.svg'
import GraduatedProperty from '../resources/images/svg/GraduatedProperty.svg'
import ExitedProperty from '../resources/images/svg/ExitedProperty.svg'
import studentActions from '../resources/images/svg/studentActions.svg'

import markAsExited from '../resources/images/svg/markAsExited.svg'

import deleteStudentRed from '../resources/images/svg/deleteStudentRed.svg'
import alertTriangle from '../resources/images/svg/alertTriangle.svg'
import addCircleBlue from '../resources/images/svg/addCircleBlue.svg'
import close from '../resources/images/svg/close.svg'
import circularBlue from '../resources/images/svg/circularBlue.svg'
import circlePlusGrey from '../resources/images/svg/circlePlusGrey.svg'
import ReportIcon from '../resources/images/svg/ReportIcon.svg'
import pdfile from '../resources/images/svg/pdfile.svg'
import menuBlue from '../resources/images/svg/menuBlue.svg'
import menuGrey from '../resources/images/svg/menuGrey.svg'
import uploadBlue from '../resources/images/svg/uploadBlue.svg'
import replaceBlue from '../resources/images/svg/replaceBlue.svg'
import editPencilgray from '../resources/images/svg/editPencilgray.svg'

const CustomIcon = ({
	name,
	style,
	className,
	onClick,
	alt,
	onMouseDown,
	svgStyle,
}) => {
	const createIcon = ({ src, style, className, svgStyle, onClick }) => {
		return (
			<ReactSVG
				src={src}
				style={style}
				className={className}
				beforeInjection={(svg) => {
					svg.setAttribute('style', svgStyle)
				}}
				onClick={onClick}
			/>
		)
	}

	const theme = useTheme()

	const light2 = {}

	const iconsList = [
		{ myPeegu: myPeegu },
		{ eye: eye },
		{ eyeHidden: eyeHidden },
		{ linkExpired: linkExpired },
		{ academicBlack: academicBlack },
		{ counsellorBlack: counsellorBlack },
		{ dashboardBlack: dashboardBlack },
		{ initiationBlack: initiationBlack },
		{ arrowDownBlack: arrowDownBlack },
		{ initiationBlue: initiationBlue },
		{ dashboardBlue: dashboardBlue },
		{ academicBlue: academicBlue },
		{ counsellorBlue: counsellorBlue },
		{ arrowDownBlue: arrowDownBlue },
		{ arrowUpBlue: arrowUpBlue },
		{ dotBlue: dotBlue },
		{ editPencilBlue: editPencilBlue },
		{ alertCircle: alertCircle },
		{ eclipseRed: eclipseRed },
		{ tickCircle: tickCircle },
		{ eclipseGreen: eclipseGreen },
		{ toastError: toastError },
		{ eclipseBlue: eclipseBlue },
		{ toastSuccess: toastSuccess },
		{ eclipsePurple: eclipsePurple },
		{ search: search },
		{ frame: frame },
		{ sliders: sliders },
		{ plusWhite: plusWhite },
		{ cancelRounded: cancelRounded },
		{ noSchoolsBlack: noSchoolsBlack },
		{ wireBroken: wireBroken },
		{ radioCheckedBlue: radioCheckedBlue },
		{ radioUncheckedBlue: radioUncheckedBlue },
		{ doneWhite: doneWhite },
		{ man: man },
		{ editPencilBlack: editPencilBlack },
		{ deleteRed: deleteRed },
		{ editPencilWhite: editPencilWhite },
		{ minusRed: minusRed },
		{ caretDown: caretDown },
		{ trashRed: trashRed },
		{ descArrow: descArrow },
		{ ascArrow: ascArrow },
		{ checkedBoxBlue: checkedBoxBlue },
		{ uncheckedBox: uncheckedBox },
		{ academicRed: academicRed },
		{ inActivateSchool: inActivateSchool },
		{ calender: calender },
		{ uploadYellow: uploadYellow },
		{ caretSolidDown: caretSolidDown },
		{ caretSolidRight: caretSolidRight },
		{ clockBlack: clockBlack },
		{ trashBlack: trashBlack },
		{ menuDotsBlue: menuDotsBlue },
		{ suggestionsArrow: suggestionsArrow },
		{ redSquare: redSquare },
		{ yellowSquare: yellowSquare },
		{ greenSquare: greenSquare },
		{ dashboardHeaderImage: dashboardHeaderImage },
		{ view: view },
		{ roundedLeftArrowGray: roundedLeftArrowGray },
		{ roundedLeftArrowBlack: roundedLeftArrowBlack },
		{ roundedRightArrowGray: roundedRightArrowGray },
		{ roundedRightArrowBlack: roundedRightArrowBlack },
		{ roundedRightArrowBlack: roundedRightArrowBlack },
		{ roundedRightArrowBlack: roundedRightArrowBlack },
		{ CarretDoubleRight: CarretDoubleRight },
		{ CarretDoubleLeft: CarretDoubleLeft },
		{ csvIcon: csvIcon },
		{ arrowTopRight: arrowTopRight },
		{ download: download },
		{ downloadWhite: downloadWhite },
		{ eclipseBlueStart: eclipseBlueStart },
		{ eclipseBlueEnd: eclipseBlueEnd },
		{ arrowTopRightWhite: arrowTopRightWhite },
		{ groupBaseline: groupBaseline },
		{ topThreeStars: topThreeStars },
		{ like: like },
		{ unCheckedRound: unCheckedRound },
		{ assessmentBlack: assessmentBlack },
		{ assessmentBlue: assessmentBlue },
		{ dashboardBook: dashboardBook },
		{ dashboardPPT: dashboardPPT },
		{ errorFile: errorFile },
		{ DeActivateIcon: DeActivateIcon },
		{ alertOctagon: alertOctagon },
		{ dropDown: dropDown },
		{ disabledCheckedRound: disabledCheckedRound },
		{ uncheckRound: uncheckRound },
		{ schoolDetailsActionIcon: schoolDetailsActionIcon },
		{ Edit: Edit },
		{ Promote: Promote },
		{ ShiftSection: ShiftSection },
		{ graduation: graduation },
		{ exit: exit },
		{ promotBiggerIcon: promotBiggerIcon },
		{ ShiftSection: ShiftSection },
		{ graduation: graduation },
		{ exit: exit },
		{ promotBiggerIcon: promotBiggerIcon },
		{ ActiveProperty: ActiveProperty },
		{ GraduatedProperty: GraduatedProperty },
		{ ExitedProperty: ExitedProperty },
		{ studentActions: studentActions },
		{ markAsExited: markAsExited },
		{ deleteStudentRed: deleteStudentRed },
		{ alertTriangle: alertTriangle },
		{
			addCircleBlue: addCircleBlue,
		},
		{ close: close },
		{ circularBlue: circularBlue },
		{
			circlePlusGrey: circlePlusGrey,
		},
		{
			ReportIcon: ReportIcon,
		},
		{ pdfile: pdfile },
		{
			menuBlue: menuBlue,
		},
		{ menuGrey: menuGrey },
		{ uploadBlue: uploadBlue },
		{ replaceBlue: replaceBlue },
		{ editPencilgray: editPencilgray },
	]

	iconsList.forEach((iconObj) => {
		const [iconName, icon] = Object.entries(iconObj)[0]
		light2[iconName] = createIcon({
			src: icon,
			style,
			className,
			svgStyle,
			onClick,
		})
	})

	// const light = {
	//   myPeegu: createIcon({
	//     src: myPeegu,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   eye: createIcon({
	//     src: eye,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   eyeHidden: createIcon({
	//     src: eyeHidden,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   linkExpired: createIcon({
	//     src: linkExpired,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   academicBlack: createIcon({
	//     src: academicBlack,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   counsellorBlack: createIcon({
	//     src: counsellorBlack,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   dashboardBlack: createIcon({
	//     src: dashboardBlack,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   initiationBlack: createIcon({
	//     src: initiationBlack,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   arrowDownBlack: createIcon({
	//     src: arrowDownBlack,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   initiationBlue: createIcon({
	//     src: initiationBlue,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   dashboardBlue: createIcon({
	//     src: dashboardBlue,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   academicBlue: createIcon({
	//     src: academicBlue,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   counsellorBlue: createIcon({
	//     src: counsellorBlue,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   arrowDownBlue: createIcon({
	//     src: arrowDownBlue,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   arrowUpBlue: createIcon({
	//     src: arrowUpBlue,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   dotBlue: createIcon({
	//     src: dotBlue,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   editPencilBlue: createIcon({
	//     src: editPencilBlue,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   alertCircle: createIcon({
	//     src: alertCircle,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   eclipseRed: createIcon({
	//     src: eclipseRed,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   tickCircle: createIcon({
	//     src: tickCircle,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   eclipseGreen: createIcon({
	//     src: eclipseGreen,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   toastError: createIcon({
	//     src: toastError,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   eclipseBlue: createIcon({
	//     src: eclipseBlue,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   toastSuccess: createIcon({
	//     src: toastSuccess,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   eclipsePurple: createIcon({
	//     src: eclipsePurple,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   search: createIcon({
	//     src: search,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   frame: createIcon({
	//     src: frame,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   sliders: createIcon({
	//     src: sliders,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   plusWhite: createIcon({
	//     src: plusWhite,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   cancelRounded: createIcon({
	//     src: cancelRounded,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   noSchoolsBlack: createIcon({
	//     src: noSchoolsBlack,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   wireBroken: createIcon({
	//     src: wireBroken,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   radioCheckedBlue: createIcon({
	//     src: radioCheckedBlue,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   radioUncheckedBlue: createIcon({
	//     src: radioUncheckedBlue,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   doneWhite: createIcon({
	//     src: doneWhite,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   man: createIcon({
	//     src: man,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   editPencilBlack: createIcon({
	//     src: editPencilBlack,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   deleteRed: createIcon({
	//     src: deleteRed,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   editPencilWhite: createIcon({
	//     src: editPencilWhite,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   minusRed: createIcon({
	//     src: minusRed,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   caretDown: createIcon({
	//     src: caretDown,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   trashRed: createIcon({
	//     src: trashRed,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   descArrow: createIcon({
	//     src: descArrow,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   ascArrow: createIcon({
	//     src: ascArrow,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   checkedBoxBlue: createIcon({
	//     src: checkedBoxBlue,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   uncheckedBox: createIcon({
	//     src: uncheckedBox,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   academicRed: createIcon({
	//     src: academicRed,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   inActivateSchool: createIcon({
	//     src: inActivateSchool,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   calender: createIcon({
	//     src: calender,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	//   uploadYellow: createIcon({
	//     src: uploadYellow,
	//     style,
	//     className,
	//     svgStyle,
	//     onClick,
	//   }),
	// };

	const dark = {}

	return (
		// <div>{theme.palette.mode === 'light' ? light[name] : dark[name]}</div>
		<div>{theme.palette.mode === 'light' ? light2[name] : dark[name]}</div>
	)
}

export default CustomIcon
