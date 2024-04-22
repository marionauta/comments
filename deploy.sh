set -ex
scp $3 $1:$2/$3/$3.new
ssh $1 /bin/bash << EOF
  set -ex
  cd $2/$3
  systemctl stop $3.service
  mv $3.new $3
  systemctl start $3.service
EOF
