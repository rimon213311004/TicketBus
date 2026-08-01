#!/bin/bash
# End-to-end verification of the booking slice.
set -e
API=http://localhost:5000/api
DATE=$(date -d "+3 days" +%Y-%m-%d)

echo "=== 1. Login as customer ==="
TOKEN=$(curl -s -X POST $API/auth/login -H "Content-Type: application/json" \
  -d '{"email":"demo@ticketbus.com","password":"Demo@123"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).data.accessToken")
echo "customer token ok"

echo "=== 2. Search trips ==="
TRIP=$(curl -s "$API/trips/search?from=Dhaka&to=Chattogram&date=$DATE" | node -pe "JSON.parse(require('fs').readFileSync(0)).data.trips[0]._id")
echo "trip: $TRIP"

echo "=== 3. Seat availability ==="
curl -s "$API/trips/$TRIP/seats" | node -pe "const d=JSON.parse(require('fs').readFileSync(0)).data; \`fare=\${d.fare} total=\${d.totalSeats} available=\${d.availableCount}\`"

echo "=== 4. Hold seats A1,A2 ==="
curl -s -X POST $API/bookings/hold -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"tripId\":\"$TRIP\",\"seatNumbers\":[\"A1\",\"A2\"]}" | node -pe "JSON.stringify(JSON.parse(require('fs').readFileSync(0)).data)"

echo "=== 5. Concurrency: second user tries the same seat ==="
TOKEN2=$(curl -s -X POST $API/auth/register -H "Content-Type: application/json" \
  -d "{\"name\":\"Race Tester\",\"email\":\"race$RANDOM@test.com\",\"phone\":\"01712345678\",\"password\":\"Test@123\"}" \
  | node -pe "JSON.parse(require('fs').readFileSync(0)).data.accessToken")
curl -s -X POST $API/bookings/hold -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN2" \
  -d "{\"tripId\":\"$TRIP\",\"seatNumbers\":[\"A1\"]}" | node -pe "const r=JSON.parse(require('fs').readFileSync(0)); \`success=\${r.success} msg=\${r.message}\`"

echo "=== 6. Create booking (bKash) ==="
BP=$(curl -s "$API/trips/$TRIP" | node -pe "JSON.parse(require('fs').readFileSync(0)).data.trip.boardingPoints[0]._id")
DP=$(curl -s "$API/trips/$TRIP" | node -pe "JSON.parse(require('fs').readFileSync(0)).data.trip.droppingPoints[0]._id")
BOOKING=$(curl -s -X POST $API/bookings -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"tripId\":\"$TRIP\",\"seatNumbers\":[\"A1\",\"A2\"],\"passengers\":[{\"name\":\"Raihan Rimon\",\"age\":26,\"gender\":\"male\",\"seatNumber\":\"A1\"},{\"name\":\"Ayesha Rahman\",\"age\":24,\"gender\":\"female\",\"seatNumber\":\"A2\"}],\"contactName\":\"Raihan Rimon\",\"contactPhone\":\"01711111111\",\"contactEmail\":\"raihan@test.com\",\"boardingPointId\":\"$BP\",\"droppingPointId\":\"$DP\",\"paymentMethod\":\"bkash\"}")
BID=$(echo "$BOOKING" | node -pe "JSON.parse(require('fs').readFileSync(0)).data.booking._id")
echo "$BOOKING" | node -pe "const b=JSON.parse(require('fs').readFileSync(0)).data.booking; \`code=\${b.bookingCode} status=\${b.status} payable=\${b.payableAmount}\`"

echo "=== 7. Submit bKash TrxID ==="
TRX="BKH$RANDOM$RANDOM"
AMT=$(echo "$BOOKING" | node -pe "JSON.parse(require('fs').readFileSync(0)).data.booking.payableAmount")
curl -s -X POST $API/payments/$BID/submit -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"method\":\"bkash\",\"senderNumber\":\"01711111111\",\"trxId\":\"$TRX\",\"amount\":$AMT}" \
  | node -pe "const b=JSON.parse(require('fs').readFileSync(0)).data.booking; \`status=\${b.status} payment=\${b.payment.status} trx=\${b.payment.trxId}\`"

echo "=== 8. Ticket blocked before verification? ==="
curl -s -o server/scripts/out/voucher.pdf -w "http=%{http_code} type=%{content_type}\n" "$API/tickets/$BID/pdf" -H "Authorization: Bearer $TOKEN"
node -pe "const b=require('fs').readFileSync('server/scripts/out/voucher.pdf'); 'voucher bytes=' + b.length"

echo "=== 9. Admin verifies ==="
ADMIN=$(curl -s -X POST $API/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@ticketbus.com","password":"Admin@123"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).data.accessToken")
PID=$(curl -s "$API/payments/pending" -H "Authorization: Bearer $ADMIN" | node -pe "const p=JSON.parse(require('fs').readFileSync(0)).data.payments; p.find(x=>x.trxId==='$TRX')._id")
curl -s -X POST $API/payments/$PID/verify -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN" -d '{}' \
  | node -pe "const b=JSON.parse(require('fs').readFileSync(0)).data.booking; \`status=\${b.status} payment=\${b.payment.status}\`"

echo "=== 10. Download real ticket ==="
curl -s -o server/scripts/out/ticket.pdf -w "http=%{http_code} type=%{content_type}\n" "$API/tickets/$BID/pdf" -H "Authorization: Bearer $TOKEN"
node -pe "const b=require('fs').readFileSync('server/scripts/out/ticket.pdf'); 'ticket bytes=' + b.length + ' pdf=' + (b.slice(0,4).toString()==='%PDF')"

echo "=== 11. Reused TrxID rejected? ==="
curl -s -X POST $API/bookings/hold -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"tripId\":\"$TRIP\",\"seatNumbers\":[\"B1\"]}" > /dev/null
B2=$(curl -s -X POST $API/bookings -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"tripId\":\"$TRIP\",\"seatNumbers\":[\"B1\"],\"passengers\":[{\"name\":\"Test User\",\"gender\":\"male\",\"seatNumber\":\"B1\"}],\"contactName\":\"Test\",\"contactPhone\":\"01711111111\",\"contactEmail\":\"t@test.com\",\"boardingPointId\":\"$BP\",\"droppingPointId\":\"$DP\",\"paymentMethod\":\"bkash\"}" \
  | node -pe "JSON.parse(require('fs').readFileSync(0)).data.booking._id")
A2=$(curl -s "$API/bookings/$B2" -H "Authorization: Bearer $TOKEN" | node -pe "JSON.parse(require('fs').readFileSync(0)).data.booking.payableAmount")
curl -s -X POST $API/payments/$B2/submit -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"method\":\"bkash\",\"senderNumber\":\"01711111111\",\"trxId\":\"$TRX\",\"amount\":$A2}" \
  | node -pe "const r=JSON.parse(require('fs').readFileSync(0)); \`success=\${r.success} msg=\${r.message}\`"

echo "=== 12. Booked seat now unavailable? ==="
curl -s "$API/trips/$TRIP/seats" | node -pe "const d=JSON.parse(require('fs').readFileSync(0)).data; const s=d.seats.filter(x=>['A1','A2','B1'].includes(x.seatNumber)); s.map(x=>x.seatNumber+'='+x.status).join(' ')"

echo "=== 13. Cash booking voucher ==="
curl -s -X POST $API/bookings/hold -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"tripId\":\"$TRIP\",\"seatNumbers\":[\"C1\"]}" > /dev/null
B3=$(curl -s -X POST $API/bookings -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"tripId\":\"$TRIP\",\"seatNumbers\":[\"C1\"],\"passengers\":[{\"name\":\"Cash Payer\",\"gender\":\"female\",\"seatNumber\":\"C1\"}],\"contactName\":\"Cash\",\"contactPhone\":\"01711111111\",\"contactEmail\":\"c@test.com\",\"boardingPointId\":\"$BP\",\"droppingPointId\":\"$DP\",\"paymentMethod\":\"cash\"}")
echo "$B3" | node -pe "const b=JSON.parse(require('fs').readFileSync(0)).data.booking; \`status=\${b.status} holdExpires=\${b.holdExpiresAt}\`"

echo "=== ALL CHECKS DONE ==="
