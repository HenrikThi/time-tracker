import { useRef, ChangeEvent, useState } from "react";
import {
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import ComputationService, { LogEntry } from "./computation";

export default function App() {
  const computation = new ComputationService();

  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [totalWorked, setTotalWorked] = useState<string>();
  const [overtime, setOvertime] = useState<string>();

  const startUpload = () => {
    document.getElementById("upload-input")?.click();
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    const file = e.target.files[0];
    const { name } = file;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (!evt?.target?.result) {
        return;
      }
      const { result } = evt.target;
      const entries = computation.parseFile(result as string);
      setLogEntries(entries);
      const total = computation.calculateTotalWork(entries);
      setTotalWorked(computation.formatDuration(total));

      const overtime = computation.calculateOvertime(entries);
      setOvertime(computation.formatDuration(overtime));
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <Fab
        onClick={() => startUpload()}
        color="primary"
        sx={{
          margin: 0,
          top: "auto",
          right: 20,
          bottom: 20,
          left: "auto",
          position: "fixed",
        }}
      >
        <AddIcon />
        <input
          id="upload-input"
          hidden
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
        />
      </Fab>
      <h1>Overtime: {overtime}</h1>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Datum</TableCell>
              <TableCell align="right">Zeiten</TableCell>
              <TableCell align="right">Arbeitszeit</TableCell>
              <TableCell align="right">Pause</TableCell>
              <TableCell align="right">Notiz</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logEntries.map((logEntry, idx) => (
              <TableRow
                key={idx}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {logEntry.startTime
                    .format("llll")
                    .split(" ")
                    .slice(0, 4)
                    .join(" ")}
                </TableCell>
                <TableCell align="right">
                  {logEntry.startTime.format("hh:mm")} -{" "}
                  {logEntry.endTime.format("hh:mm")}
                </TableCell>
                <TableCell align="right">
                  {computation.formatDuration(logEntry.workDuration)}
                </TableCell>
                <TableCell align="right">
                  {computation.formatDuration(logEntry.breakDuration)}
                </TableCell>
                <TableCell align="right">{logEntry.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
