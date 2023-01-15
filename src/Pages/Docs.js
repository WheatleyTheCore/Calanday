import React from 'react'
import { Outlet, Link } from "react-router-dom";

import '../styles.css'
import workdayImage from '../Assets/workday.png'

const Docs = () => {
    return (
        <div>
            <div className='heading'>
                <h1>The Docs!</h1>
            </div>
            <div>
                <p>Here are the steps to convert your workday schedule to a calandar file (which you can import into most major calandar systems):</p>
                <h4 style={{paddingLeft: "2%"}}>1. Export your calandar from workday</h4>
                <div className='tutorialStep'>
                    <p>Go to Workday, then go to the Academics page. Then go to "Planning & Registration" &gt; "View My Courses". After that, just click on the excel button (shown below) to export your schedule as a .xlsx file.</p>
                    <img className="image" src={workdayImage} alt="Image from workday" />
                </div>
                <h4 style={{paddingLeft: "2%"}}>2. Import the excel file into this site</h4>
                <div className='tutorialStep'>
                    <p>On the <Link to="/">Home Page of this site</Link>, click "choose file" where it says "Exported workday schedule" and select the file you exported from workday.</p>
                </div>
                <h4 style={{paddingLeft: "2%"}}>3. Deselect courses you don't want added to your schedule</h4>
                <div className='tutorialStep'>
                    <p>Only courses marked "active" will be exported, so delect any you don't want to import into your calandar.</p>
                </div>
                <h4 style={{paddingLeft: "2%"}}>4. Export the calandar file</h4>
                <div className='tutorialStep'>
                    <p>Click export! A .ics file will automatically start downloading, which you can import into pretty much any major calandar system (e.g. Outlook, Apple Calandar, Google Calandar).</p>
                </div>
            </div>
        </div>
    )
}

export default Docs