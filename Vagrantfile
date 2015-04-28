# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu"

  config.vm.network :private_network, ip: "192.168.33.13"
  config.vm.network :forwarded_port, host: 8083, guest: 80

  config.vm.provider :virtualbox do |vb|
    vb.customize ["modifyvm", :id, "--name", "Mnogobyte Test case #1", "--memory", "2048"]
  end

  # Shared folder from the host machine to the guest machine. Uncomment the line
  # below to enable it.
  #config.vm.synced_folder "../../../my-cool-app", "/webapps/mycoolapp/my-cool-app"
  config.vm.synced_folder ".", "/vagrant", type: "nfs"

  config.vm.provision "shell", path: "bootstrap.sh"

  # Ansible provisioner.
  config.vm.define :dev do |dev|
    dev.vm.provision :shell, inline: 'ansible-playbook -i /vagrant/ansible/local /vagrant/ansible/vagrant.yml -c local'
  end
end
