import React from 'react'
import { IoMdHome } from "react-icons/io";
import { FaAngleRight } from "react-icons/fa6";
function Terms() {
  return (
    <div className=" px-4 sm:px-6 lg:px-8">
    <div className="  bg-white p-8 rounded-lg ">
        <h1 className="text-4xl font-bold text-black mb-6 text-center">Terms and Conditions </h1>
        <h2 className="text-2xl font-bold text-blue-800 mt-4  text-start">General Conditions</h2>
        <dl className='text-start'>
            <dt className='font-semibold'>  1. Agreement Acceptance </dt>
            <dd>   By using our services, you agree to these Terms and Conditions. If you do not agree, please refrain from using the software or applications.</dd>
            <dt className='font-semibold'>2. Service Usage</dt>
            <dd> Access to the software is provided on a subscription basis or as per your purchase agreement</dd>
            <dd>
                Users are responsible for maintaining the confidentiality of their login credentials
            </dd>
            <dt className='font-semibold'>
                3. Data Privacy
            </dt>
            <dd>
                All personal and business data entered into the system will be securely stored and used solely for service delivery.

            </dd>
            <dd>
                We comply with relevant data protection laws.
            </dd>
            <dt className='font-semibold'>
                4. Software Updates
            </dt>
            <dd>    Regular updates will be provided to ensure system security and functionality.</dd>
            <dd>Certain features may require additional payments post-launch.</dd>
            <dt className='font-semibold'>5. Prohibited Use   </dt>
            <dd>   Users shall not misuse the software for illegal purposes or unauthorized activities. </dd>
            <dt className='font-semibold'>6. Termination</dt>
            <dd>  Misuse or violation of the terms can result in account suspension or termination without prior notice.  </dd>
        </dl>
        <h2 className="text-2xl font-bold text-blue-800 mt-4 text-start ">Trip Management System</h2>
        <dl>
            <dt className='font-semibold'> 1. Scope of Service </dt>
            <dd> he system is designed for trip scheduling, vehicle management, and GPS tracking.</dd>
            <dd> Users must ensure that all data entered (e.g., trip details) is accurate.</dd>

            <dt className='font-semibold'>2. Liability </dt>
            <dd>  We are not liable for any delays, inaccuracies, or losses resulting from incorrect data entry or misuse of the system.</dd>
            <dt className='font-semibold'>  3. GPS Tracking</dt>
            <dd>GPS tracking is provided for real-time monitoring, but availability depends on network coverage and device compatibility.</dd>
        </dl>
        <h2 className="text-2xl font-bold text-blue-800 mt-4 text-start">Tyre Management System </h2>

        <dl>
            <dt className='font-semibold'>1. Service Features </dt>
            <dd >Includes tyre tracking, maintenance scheduling, and usage history</dd>
            <dd>Tyre data accuracy is the responsibility of the user.</dd>
            <dt className='font-semibold'>2. Warranty   </dt>
            <dd>The system does not guarantee prevention of tyre-related incidents.              </dd>
        </dl>
        <h2 className="text-2xl font-bold text-blue-800 mt-4  text-start">Driver Tracking via Mobile Application    </h2>

        <dl>
            <dt className='font-semibold'>1. Tracking Consent </dt>
            <dd >Drivers must provide explicit consent for location tracking via the mobile app.
            </dd>

            <dt className='font-semibold'>2. Accuracy  </dt>
            <dd>Tracking accuracy may vary depending on mobile network availability.   </dd>
            <dt className='font-semibold'>3. Privacy     </dt>
            <dd>
                Driver location data is confidential and will not be shared with unauthorized parties.
            </dd>

        </dl>
        <h2 className="text-2xl font-bold text-blue-800 mt-4 text-start">Documents Reminder System</h2>
        <dl>
            <dt className='font-semibold'>1. Service Features
            </dt>
            <dd >Alerts for document renewals (licenses, permits, insurance, etc.).</dd>
            <dd> Users are responsible for setting accurate reminder dates. </dd>

            <dt className='font-semibold'> 2. Limitations</dt>
            <dd>  We are not liable for missed deadlines or penalties due to incorrect data entry or system failure.</dd>

        </dl>
        <h2 className="text-2xl font-bold text-blue-800 mt-4  text-start">Billing Software  </h2>
        <dl>
            <dt className='font-semibold'>1. Billing Accuracy</dt>
            <dd > Users must verify all invoices generated.</dd>
            <dd>The software is not responsible for incorrect billing caused by user error.</dd>

            <dt className='font-semibold'>2. Tax Compliance</dt>
            <dd> The user is responsible for ensuring the software’s tax configurations comply with local regulations.</dd>

        </dl>
        <h2 className="text-2xl font-bold text-blue-800 mt-4  text-start"> Disclaimer</h2>
        <dl>

            <dd>he software is provided “as is.” We do not guarantee uninterrupted or error-free service. </dd>
            <dd>
                The user assumes all risks associated with software usage.
            </dd>
            <dd>
                For legal protection, consider consulting with a legal professional to finalize these terms.
            </dd>
        </dl>


    </div>
</div>
  )
}

export default Terms