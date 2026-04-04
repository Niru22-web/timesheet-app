#!/bin/bash
export PGPASSWORD='Niranjan@1093'
echo "Listing columns for table 'reimbursements':"
psql -h localhost -U postgres -d timesheet -c "\d reimbursements"
echo "Listing columns for table 'leaves':"
psql -h localhost -U postgres -d timesheet -c "\d leaves"
echo "Listing columns for table 'leave_balance':"
psql -h localhost -U postgres -d timesheet -c "\d leave_balance"
echo "Listing columns for table 'Project':"
psql -h localhost -U postgres -d timesheet -c "\d \"Project\""
echo "Listing columns for table 'Job':"
psql -h localhost -U postgres -d timesheet -c "\d \"Job\""
