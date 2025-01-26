import { ethers } from "hardhat";
import * as fs from "fs";
import * as XLSX from "xlsx";

async function main() {
    
    const contractAddress = "0x071215bd2c5bc7042b8C9151D4aC2Bc4DEF20d9C";
    const contractABI = [
        "function registerStudent(string _firstname, string _lastname, string _twitter, string _linkedin, string _github, uint8 _track, uint8 _cohort, address _studentAddress) external"
    ];

    const [deployer] = await ethers.getSigners();
    const contract = new ethers.Contract(contractAddress, contractABI, deployer);

    const filePath = "./blockfuse.csv";

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const students: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (students.length <= 1) {
        console.error("The Excel file is empty or missing headers.");
        return;
    }

    const headers = students[0];
    const dataRows = students.slice(1);

    for (const row of dataRows) {
        try {
            const [
                firstname,
                lastname,
                twitter,
                linkedin,
                github,
                trackString,
                cohortString,
                studentAddress,
            ] = row;
            
            if (!firstname || !lastname || !trackString || !cohortString || !studentAddress) {
                console.error(`Invalid data in row: ${row}`);
                continue;
            }

            const track = trackString.toLowerCase() === "web3" ? 1 : 0;
            const cohort = parseInt(cohortString, 10);
            let result = '0x' + `${studentAddress}`;
            
            console.log(`Registering student: ${firstname} ${lastname}`);
            const tx = await contract.registerStudent(
                firstname,
                lastname,
                twitter || "",
                linkedin || "",
                github || "",
                track,
                cohort,
                result
            );

            await tx.wait();

            console.log(`Student ${result} registered successfully.`);
        } catch (error) {
            console.error(`Error registering student in row: ${row}`);
            console.error(error);
        }
    }
}

main().catch((error) => {
    console.error("Error in script execution:", error);
    process.exit(1);
});
