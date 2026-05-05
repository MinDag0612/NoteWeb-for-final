[manager]
${manager}

[workers]
%{ for ip in workers ~}
${ip}
%{ endfor ~}

[all:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=${ssh_key}
domain_name=${domain_name}
email=${email}