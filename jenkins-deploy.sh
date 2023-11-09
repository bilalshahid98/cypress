#!/bin/sh
echo "SSH TO AZURE-SCALESET PROD-ERVER"
ssh ubuntu@40.113.234.50 -p 50000 'bash -i' << 'EOF'
 cd /home/ubuntu/nearpeer-lms-web-consumer
 git fetch
echo "CHECKNIG OUT TO PRODUCTION BRANCH"
# git checkout production
echo "PULLING OUT LATEST UPDATES FROM GIT REPO"
 git pull
# npm install
# npm run prod
 exit
EOF
